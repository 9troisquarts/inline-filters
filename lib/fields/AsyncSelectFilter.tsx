import { Input, Divider, Button, InputRef, Popover, Checkbox, Space, Tooltip } from "antd";
import Badge from '../components/Badge';
import { FieldSchema, Configuration, BaseOption, AsyncSelectInputProps } from "../types";
import { useEffect, useRef, useState } from "react";
import scopeSvg from '../icons/scope.svg';
import SVG from 'react-inlinesvg';
import { useDebounce, useSelections } from "ahooks";
import circleXMark from '../icons/circle-xmark.svg';
import '../index.css';
import { isEqual, set } from "lodash";

type ValueType = string | number;

type FilterProps = {
  field: FieldSchema & { name: string };
  value?: BaseOption[];
  defaultConfig: Configuration;
  onChange: (values: {
    [k: string]: BaseOption | BaseOption[] | undefined;
  }) => void;
};

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
      clearFilterText,
      okText
    } = {} as AsyncSelectInputProps['inputProps'],
  } = inputConfig;

  const countBadgeThreshold = inputConfig?.inputProps?.countBadgeThreshold || defaultConfig.countBadgeThreshold || 0;
  const allowClear = inputConfig?.inputProps?.allowClear || defaultConfig.allowClear || false;
  const [search, setSearch] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebounce(search, { wait: 200 })
  const [options, setOptions] = useState<BaseOption[]>([])
  const [cachedOptions, setCachedOptions] = useState<{ [k: string]: BaseOption[]}>({});

  const {
    selected: internalValue,
    setSelected
  } = useSelections<BaseOption>([]);

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target?.value);
  const selectRef = useRef<InputRef>(null);

  const onOk = () => {
    onChange({ [field.name]: internalValue });
    setPopoverIsOpen(false);
  }

  const onReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ [field.name]: undefined });
  }

  const handleOpenChange = (visible: boolean) => {
    setPopoverIsOpen(visible);
    if (!visible && !isEqual(props?.value, internalValue)) {
      onOk();
    }
  };

  const onSelect = (option: BaseOption) => {
    if (internalValue?.some(o => o.value === option.value)) {
      setSelected(internalValue.filter(o => o.value !== option.value));
    } else {
      setSelected([...internalValue, option]);
    }
  };

  useEffect(() => {
    if(selectRef && selectRef.current)  {
      setTimeout(() => {
        if(selectRef.current) selectRef.current.select();
      }, 0)
    }
  }, [popoverIsOpen])

  useEffect(() => {
    if (debouncedSearch !== '' && debouncedSearch !== undefined) {
      if (cachedOptions[debouncedSearch]) {
        setOptions(cachedOptions[debouncedSearch]);
      } else {
        loadOptions(debouncedSearch).then((results: BaseOption[]) => {
          setCachedOptions((prev) => set(prev, debouncedSearch, results));
          setOptions(results)
        })
      }
    } else if (popoverIsOpen) {
      // Fetch default options when the popover is opened
      if (cachedOptions['']) {
        setOptions(cachedOptions['']);
      } else {
        loadOptions('')
          .then((results: BaseOption[]) => {
            setOptions(results?.slice(0, defaultOptionsCount))
          });
      }
    }
  }, [debouncedSearch, popoverIsOpen])

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
      <div className="wand__inline-filter__options-container">
        {(!search || search.length === 0) && defaultConfig.pullSelectedToTop && multiple && (
          <>
            {value?.map(o => (
              <Option
                key={`selected-${o.value}`}
                option={o}
                selectedValues={value.map(o => o.value)}
                onSelect={onSelect}
                showCheck={!!multiple}
              />
            ))}
            <Divider className="wand__inline-filter__popover-divider" />
          </>
        )}
        {options.map(o => (
          <Option
            key={o.value}
            option={o}
            selectedValues={internalValue.map(o => o.value)}
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
      <div className={`wand__inline-filter__filter ${value && value.length > 0 ? 'wand__inline-filter__filter--filled' : ''} ${internalValue.length > 0 || popoverIsOpen ? 'wand__inline-filter__filter--focused' : ''}`}>
        <Space>
          <span className="wand__inline-filter__label">
            {field.label}
            {value && value.length > 0 && multiple && (
              <>
                {value.length > countBadgeThreshold ? (
                  <Badge className="wand__inline-filter__badge" count={value.length} />
                ) : (
                  <span>
                    &nbsp;:&nbsp;{value.map(o => o.label).join("; ")}
                  </span>
                )}
              </>
            )}
            {field.icon && (!value || value.length === 0) && (
              <span style={{ marginLeft: 8 }}>
                {field.icon}
              </span>
            )}
            {allowClear && value && value.length > 0 && (
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

const Option = ({ option, selectedValues, showCheck = false, onSelect }: { option: BaseOption; selectedValues?: ValueType[]; showCheck: boolean; onSelect: (value: BaseOption) => void;}) => {

  const handleSelect = (opt: BaseOption) => {
    onSelect(opt)
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
