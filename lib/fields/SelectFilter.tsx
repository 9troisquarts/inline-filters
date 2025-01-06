// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BaseOption, Configuration, FieldSchema, OptionType, OptionWithChildren, SelectInputProps } from '../types';
import SVG from 'react-inlinesvg';
import { cloneDeep, isEqual } from 'lodash';
import { Button, Checkbox, Divider, Input, InputRef, Popover, Space, Tooltip } from 'antd';
import { useSelections } from 'ahooks';
import scopeSvg from '../icons/scope.svg';
import circleXMark from '../icons/circle-xmark.svg';
import '../index.css';
import filterOption from '../utils/filterOption';
import Badge from '../components/Badge';

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

const isBaseOption = (option?: OptionType): option is BaseOption => {
  return (!!option && (option as BaseOption).value !== undefined);
}

const isOptionWithChildren = (option?: OptionType): option is OptionWithChildren => {
  return (!!option && (option as OptionWithChildren).options !== undefined);
}

const filterOptionsBySearch = (options: OptionType[], search: string | undefined, selectedValues: ValueType[], withSelected = 'only') => {
  const filteredOptions = options.map(o => {
    if (isOptionWithChildren(o)) {
      const cloneOption = cloneDeep(o);
      const filteredSubOptions = filterOptionsBySearch(o.options, search, selectedValues, withSelected).filter(e => !!e);
      cloneOption.options = (filteredSubOptions || []) as BaseOption[];
      return cloneOption;
    } else {
      let displayed = true;
      if (search && search.length > 0 && !filterOption(search, o)) displayed = false;
      if (withSelected === 'except' && selectedValues.includes(o.value)) displayed = false;
      if (withSelected === 'only' && !selectedValues.includes(o.value)) displayed = false;
      if (displayed) return o;
      return undefined;
    }
  }).filter(e => !!e);

  return filteredOptions.filter(o => o && (isBaseOption(o) || o.options.length > 0));
}

const flattenOptions = (options: OptionType[]): BaseOption[] => {
  return options.reduce((acc, o) => {
    if(isBaseOption(o)) return [...acc, o];
    if(isOptionWithChildren(o)) return [...acc, ...flattenOptions(o.options)];
    return acc;
  }, [] as BaseOption[]);
}

const SelectFilter: React.FC<FilterProps> = props => {
  const {
    field,
    value,
    defaultConfig,
    onChange,
  } = props;

  const {
    inputProps: {
      multiple = false,
      allowSearch = true,
      searchPlaceholder = undefined,
      selectAllText,
      unselectAllText,
      clearFilterText,
      okText,
      options = [],
    } = {}
  } = (field?.input || {}) as SelectInputProps;

  const countBadgeThreshold = (field?.input as SelectInputProps)?.inputProps?.countBadgeThreshold || defaultConfig.countBadgeThreshold || 0;
  const allowClear = (field?.input as SelectInputProps)?.inputProps?.allowClear || defaultConfig.allowClear || false;

  const {
    selected: internalValue,
    setSelected,
    allSelected,
    partiallySelected,
    unSelectAll,
    selectAll
  } = useSelections<ValueType>(flattenOptions(options).map(o => o.value?.toString()), castValue(value));

  const [search, setSearch] = useState<string | undefined>(undefined);
  const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const selectRef = useRef<InputRef>(null);

  useEffect(() => {
    setSelected(castValue(value));
  }, [value, multiple]);

  useEffect(() => {
    if(selectRef && selectRef.current)  {
      setTimeout(() => {
        if(selectRef.current) selectRef.current.select();
      }, 0)
    }
  }, [popoverIsOpen])

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target?.value);
  
  const onSelect = (key: ValueType) => {
    if (multiple) {
      if(internalValue.includes(key)) {
        const nextValues = [...internalValue];
        nextValues.splice(nextValues.indexOf(key), 1)
        setSelected(nextValues);
      } else {
        setSelected([...internalValue, key]);
      }
    } else {
      onChange({[field.name]: internalValue.includes(key) ? undefined : key})
    }
  }

  const onSelectAll = () => {
    const nextValues = flattenOptions(options).map(o => o.value.toString());
    setSelected(nextValues);
    selectAll();
  }

  const onUnselectAll = () => {
    setSelected([]);
    unSelectAll();
  }

  const onOk = () => {
    onChange({ [field.name]: internalValue });
    setPopoverIsOpen(false);
  }

  const handleOpenChange = (visible: boolean) => {
    setPopoverIsOpen(visible);
    if(!visible && !isEqual(props?.value, internalValue)) onOk();
  }

  const onReset = (e) => {
    e.stopPropagation();
    onChange({ [field.name]: undefined });
  }

  const {
    selectedOptions,
    filteredOptions,
    currentOptions
  } = useMemo(() => {
    const alreadySelected = Array.isArray(value) ? value : [value];
    
    return {
      filteredOptions: filterOptionsBySearch(options, search, defaultConfig.pullSelectedToTop ? alreadySelected : [], search && search.length > 0 ? 'all' : 'except'),
      selectedOptions: flattenOptions(filterOptionsBySearch(options, search, alreadySelected, 'only')),
      currentOptions: flattenOptions(filterOptionsBySearch(options, undefined, alreadySelected, 'only')),
    };
  }, [options, search, Array.isArray(value) ? value.join(',') : value]);

  const selectedCount = (currentOptions || []).reduce((acc, o) => {
    if (isBaseOption(o)) return acc + 1;
    if (isOptionWithChildren(o)) return acc + o.options.length;
    return acc;
  }, 0);

  const popoverContent = (
    <>
      {allowSearch && (
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
      )}
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
            {selectedOptions.map(o => (
              <Option
                key={isBaseOption(o) ? o.value : o.label}
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
            key={isBaseOption(o) ? o.value : o.label}
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
      <div className={`wand__inline-filter__filter ${currentOptions.length > 0 ? 'wand__inline-filter__filter--filled' : ''} ${currentOptions.length > 0 || popoverIsOpen ? 'wand__inline-filter__filter--focused' : ''}`}>
        <Space>
          <span className="wand__inline-filter__label">
            {field.label}
            {currentOptions.length > 0 && !multiple && (
              <span>
                &nbsp;:&nbsp;
                {isBaseOption(currentOptions[0]) ? currentOptions[0].label : currentOptions[0].options.map(o => o.label)[0]}
              </span>
            )}
            {selectedCount > 0 && multiple && (
              <>
                {currentOptions.length > countBadgeThreshold ? (
                  <Badge className="wand__inline-filter__badge" count={selectedCount} />
                ) : (
                  <span>
                    &nbsp;:&nbsp;{currentOptions.map(o => o.label).join("; ")}
                  </span>
                )}
              </>
            )}
            {field.icon && (!currentOptions || selectedCount === 0) && (
              <span style={{ marginLeft: 8 }}>
                {field.icon}
              </span>
            )}
            {allowClear && currentOptions.length > 0 && (
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

const Option = ({ option, selectedValues, showCheck = false, onSelect }: { option: OptionType; selectedValues?: ValueType[]; showCheck: boolean; onSelect: (value: ValueType) => void;}) => {
  
  const handleSelect = (opt: OptionType) => {
    if(isBaseOption(opt)) onSelect(opt.value, opt);
  }

  if (isOptionWithChildren(option))
    return (
      <div className="wand__inline-filter__options-group">
        <div className='wand__inline-filter__options-group__title'>
          {option.label}
        </div>
        <div className="wand__inline-filter__options-container">
          {(option.options || []).map(o => (
            <Option
              key={o.value}
              option={o}
              selectedValues={selectedValues}
              onSelect={onSelect}
              showCheck={showCheck}
            />
          ))}
        </div>
      </div>
    )

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

export default SelectFilter;
