// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Configuration, FieldSchema, OptionType, SelectInputProps } from '../types';
import SVG from 'react-inlinesvg';
import { Button, Checkbox, Divider, Input, InputRef, Popover, Space } from 'antd';
import { useSelections } from 'ahooks';
import scopeSvg from '../icons/scope.svg';
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

const sortByPresenceInArray = (array: ValueType[]) => (a: any, b: any) => {
  if (array.includes(a.value) && !array.includes(b.value))
    return 1;
  if (!array.includes(a.value) && array.includes(b.value))
    return -1;
  return 0;
}

const castValue = (value?: string | string[]) => {
  if(!value) return [];

  if (Array.isArray(value)) return value;

  return [value];
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
      okText,
      countBadgeThreshold = 0,
      options = [],
    } = {}
  } = (field?.input || {}) as SelectInputProps;

  const {
    selected: internalValue,
    setSelected,
    allSelected,
    partiallySelected,
    unSelectAll,
    selectAll
  } = useSelections<string | number | undefined>(options.map(o => o.value), castValue(value));

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
  
  const onSelect = (key: string) => {
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
    const nextValues = options.map(o => o.value);
    setSelected(nextValues);
    selectAll();
  }

  const onUnselectAll = () => {
    setSelected(undefined);
    unSelectAll();
  }

  const onOk = () => {
    onChange({ [field.name]: internalValue });
    setPopoverIsOpen(false);
  }

  const selectedOptions: OptionType[] = options.filter(o => (value || []).includes(o.value));
  const selectedOptionsValues = selectedOptions.map(o => o.value);

  // let filteredOptions = options.filter(o => (!search || filterOption(search, o) && !selectedOptionsValues.includes(o.value)));
  let filteredOptions = [...options]
  if (search)
    filteredOptions = filteredOptions.filter(o => filterOption(search, o));
  else
    filteredOptions = filteredOptions.filter(o => !selectedOptionsValues.includes(o.value))
  if (search && search.length > 0) filteredOptions = filteredOptions.sort(sortByPresenceInArray(internalValue));

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
        {(!search || search.length === 0) && multiple && selectedOptions && selectedOptions.length > 0 && (
          <>
            {selectedOptions.map(o => (
              <Option
                key={o.value}
                option={o}
                checked={internalValue.includes(o.value)}
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
            checked={internalValue.includes(o.value)}
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
      onOpenChange={setPopoverIsOpen}
      trigger="click"
      overlayClassName={`wand__inline-filter__popover ${multiple ? 'wand__inline-filter__with_footer' : ''}`}
    >
      <div className={`wand__inline-filter__filter ${selectedOptions.length > 0 ? 'wand__inline-filter__filter--filled' : ''} ${selectedOptions.length > 0 || popoverIsOpen ? 'wand__inline-filter__filter--focused' : ''}`}>
        <Space>
          <span className="wand__inline-filter__label">
            {field.label}
            {selectedOptions.length > 0 && !multiple && (
              <span>
                &nbsp;:&nbsp;{options.find(o => o.value === selectedOptions[0])?.label}
              </span>
            )}
            {selectedOptions.length > 0 && multiple && (
              <>
                {selectedOptions.length > countBadgeThreshold ? (
                  <Badge className="wand__inline-filter__badge" count={selectedOptions.length} />
                ) : (
                  <span>
                    &nbsp;:&nbsp;{selectedOptions.map(o => o.label).join(", ")}
                  </span>
                )}
              </>
            )}
            {field.icon && (!selectedOptions || selectedOptions.length === 0) && (
              <span style={{ marginLeft: 8 }}>
                {field.icon}
              </span>
            )}
          </span>
        </Space>
      </div>
    </Popover>
  )
}

const Option = ({ option, checked, showCheck = false, onSelect }) => {
  return (
    <div className={`wand__inline-filter__option ${checked ? 'wand__inline-filter__option--is-selected' : ''}`} onClick={() => onSelect(option.value)}>
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
