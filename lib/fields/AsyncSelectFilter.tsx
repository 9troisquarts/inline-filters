import { Input, Divider, Button, InputRef, Popover, Checkbox, Space, Tooltip, Badge } from "antd";
import { FieldSchema, Configuration, OptionType, BaseOption, AsyncSelectInputProps } from "../types";
import { useEffect, useMemo, useRef, useState } from "react";
import scopeSvg from '../icons/scope.svg';
import SVG from 'react-inlinesvg';
import { useDebounce, useSelections } from "ahooks";
import circleXMark from '../icons/circle-xmark.svg';
import '../index.css';
import { isEqual, set } from "lodash";
import filterOption from "../utils/filterOption";

type ValueType = string | string[] | undefined;

type FilterProps = {
  field: FieldSchema & { name: string };
  value?: ValueType;
  defaultConfig: Configuration;
  onChange: (values: {
    [k: string]: ValueType | ValueType[];
  }) => void;
};

const castValue = (value?: ValueType) => {
  if(!value) return [];

  if (Array.isArray(value)) return value;

  return [value];
}

const filterOptionsBySearch = (options: BaseOption[], search: string | undefined, selectedValues: ValueType[], withSelected = 'only') => {
  const filteredOptions = options.map(o => {
      let displayed = true;
      if (search && search.length > 0 && !filterOption(search, o)) displayed = false;
      if (withSelected === 'except' && selectedValues.includes(o.value)) displayed = false;
      if (withSelected === 'only' && !selectedValues.includes(o.value)) displayed = false;
      if (displayed) return o;
      return undefined;
  }).filter(e => !!e);

  return filteredOptions
}

const AsyncSelectFilter: React.FC<FilterProps> = props => {
  const {
    field,
    value,
    defaultConfig,
    onChange,
  } = props;

  const inputConfig: AsyncSelectInputProps = (field?.input || {}) as AsyncSelectInputProps;

  const {
    inputProps: {
      loadOptions,
      defaultOptionsCount = 20,
      multiple = false,
      searchPlaceholder = undefined,
      selectAllText,
      unselectAllText,
      clearFilterText,
      okText
    } = {} as AsyncSelectInputProps['inputProps'],
  } = inputConfig;

  const countBadgeThreshold = inputConfig?.inputProps?.countBadgeThreshold || defaultConfig.countBadgeThreshold || 0;
  const allowClear = inputConfig?.inputProps?.allowClear || defaultConfig.allowClear || false;
  const [search, setSearch] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebounce(search, { wait: 200 })
  const [searchResults, setSearchResults] = useState<BaseOption[]>([])
  const [cachedOptions, setCachedOptions] = useState<BaseOption[]>([]);

  const {
    selected: internalValue,
    setSelected,
    allSelected,
    partiallySelected,
    unSelectAll,
    selectAll
  } = useSelections<ValueType>(searchResults.map(o => o.value?.toString()), castValue(value));

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target?.value);
  const selectRef = useRef<InputRef>(null);

  const onSelectAll = () => {
    const nextValues = searchResults.map(o => o.value.toString());
    setSelected(nextValues);
    selectAll();
  }

  const onUnselectAll = () => {
    setSelected([]);
    setCachedOptions([]);
    unSelectAll();
  }

  const onOk = () => {
    onChange({ [field.name]: internalValue });
    setPopoverIsOpen(false);
  }

  const onReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCachedOptions([]);
    onChange({ [field.name]: undefined });
  }

  const handleOpenChange = (visible: boolean) => {
    setPopoverIsOpen(visible);
    if (!visible && !isEqual(props?.value, internalValue)) {
      onOk();
    }
  };

  const {
    selectedOptions,
    filteredOptions,
  } = useMemo(() => {
    const alreadySelected = Array.isArray(value) ? value : [value];

    return {
      filteredOptions: filterOptionsBySearch(searchResults, search, defaultConfig.pullSelectedToTop ? alreadySelected : [], search && search.length > 0 ? 'all' : 'except'),
      selectedOptions: filterOptionsBySearch(searchResults, search, alreadySelected, 'only'),
    };
  }, [defaultConfig.pullSelectedToTop, search, searchResults, value]);

  const onSelect = (key: ValueType) => {
    if (internalValue.includes(key)) {
      const nextValues = [...internalValue];
      nextValues.splice(nextValues.indexOf(key), 1);
      setSelected(nextValues);
      setCachedOptions(cachedOptions.filter(o => o.value !== key));
    } else {
      setSelected([...internalValue, key]);
      const selectedOption = searchResults.find(o => o.value === key);
      if (selectedOption && !cachedOptions.some(o => o.value === key)) {
        setCachedOptions([...cachedOptions, selectedOption]);
      }
    }
  };

  useEffect(() => {
    if (debouncedSearch !== '' && debouncedSearch !== undefined) {
      loadOptions(debouncedSearch).then((results: BaseOption[]) => {
        setSearchResults(results)
      })
    } else if (popoverIsOpen) {
      // Fetch default options when the popover is opened
      loadOptions('')
        .then((results: BaseOption[]) => {
          setSearchResults(results.slice(0, defaultOptionsCount))
        });
    }
  }, [debouncedSearch, defaultOptionsCount, loadOptions, popoverIsOpen])

  const popoverContent = (
    <>
      <Input
        ref={selectRef}
        value={search}
        onChange={onSearchChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={!isFocused ? searchPlaceholder : undefined}
        addonBefore={(
          <div className="wand__inline-filter__search-input__icon-wrapper">
            <SVG src={scopeSvg} height={15} />
          </div>
        )}
        className={`wand__inline-filter__search-input ${isFocused || !!search ? 'wand__inline-filter__search-input--is-focused' : ''}`}
      />
      {multiple && !search && !allSelected && (
        <div className="wand__inline-filter__options-container">
          <div className='wand__filter-select-toggler'>
            <div>
              <a onClick={() => onSelectAll()}>
                {selectAllText || defaultConfig.selectAllText || 'Tout sélectionner'}
              </a>
            </div>
          </div>
          <Divider className="wand__inline-filter__popover-divider" />
        </div>
      )}
      <div className="wand__inline-filter__options-container">
        {(!search || search.length === 0) && defaultConfig.pullSelectedToTop && multiple && selectedOptions && selectedOptions.length > 0 && (
          <>
            {cachedOptions.map(o => (
              <Option
                key={o.value}
                option={o}
                selectedValues={internalValue}
                onSelect={onSelect}
                showCheck={!!multiple}
              />
            ))}
            <Divider className="wand__inline-filter__popover-divider" />
          </>
        )}
        {filteredOptions.map(o => (
          <Option
            key={o.value}
            option={o}
            selectedValues={internalValue}
            onSelect={onSelect}
            showCheck={!!multiple}
          />
        ))}
      </div>
      {multiple && (
        <>
          <div className="wand__inline-filter__options-container">
            <Divider className="wand__inline-filter__popover-divider" />
          </div>
          <div className="wand__inline-filter__popover-footer">
            {(allSelected || partiallySelected) && (!search || search.length === 0) && (
              <div>
                <a onClick={() => onUnselectAll()}>
                  {unselectAllText || defaultConfig.unselectAllText || 'Tout désélectionner'}
                </a>
              </div>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <Button
                type="primary"
                onClick={onOk}
              >
                {okText || defaultConfig.okText || 'Rechercher'}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )

  return (
    <Popover
      showArrow={false}
      open={popoverIsOpen}
      content={popoverContent}
      placement="bottom"
      onOpenChange={handleOpenChange}
      trigger="click"
      overlayClassName={`wand__inline-filter__popover ${multiple ? 'wand__inline-filter__with_footer' : ''}`}
    >
      <div className={`wand__inline-filter__filter ${cachedOptions.length > 0 ? 'wand__inline-filter__filter--filled' : ''} ${cachedOptions.length > 0 || popoverIsOpen ? 'wand__inline-filter__filter--focused' : ''}`}>
        <Space>
          <span className="wand__inline-filter__label">
            {field.label}
            {cachedOptions.length > 0 && multiple && (
              <>
                {cachedOptions.length > countBadgeThreshold ? (
                  <Badge className="wand__inline-filter__badge" count={internalValue.length} />
                ) : (
                  <span>
                    &nbsp;:&nbsp;{cachedOptions.map(o => o.label).join("; ")}
                  </span>
                )}
              </>
            )}
            {field.icon && (!cachedOptions || cachedOptions.length === 0) && (
              <span style={{ marginLeft: 8 }}>
                {field.icon}
              </span>
            )}
            {allowClear && cachedOptions.length > 0 && (
              <>
                &nbsp;
                <Tooltip
                  title={clearFilterText || defaultConfig.clearFilterText || 'Clear'}
                >
                  <a className="wand__inline-filter-close-mark" onClick={onReset}>
                    <SVG src={circleXMark} height={14} />
                  </a>
                </Tooltip>
              </>
            )}
          </span>
        </Space>
      </div>
    </Popover>
  )
}

const Option = ({ option, selectedValues, showCheck = false, onSelect }: { option: BaseOption; selectedValues?: ValueType[]; showCheck: boolean; onSelect: (value: ValueType) => void;}) => {

  const handleSelect = (opt: BaseOption) => {
    onSelect(opt.value)
  }

  const checked = selectedValues?.includes(option.value);
  return (
    <div className={`wand__inline-filter__option ${checked ? 'wand__inline-filter__option--is-selected' : ''}`} onClick={() => handleSelect(option)}>
      <Space>
        {showCheck && (
          <Checkbox checked={checked} />
        )}
        {option.children || option.label}
      </Space>
    </div>
  )
}

export default AsyncSelectFilter
