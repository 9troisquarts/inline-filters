import { useSelections } from "ahooks";
import { Button, Checkbox, Input, InputRef, Popover, Space } from "antd";
import React, { useEffect, useRef, useState } from "react";
import SVG from "react-inlinesvg";
import filterSvg from "./icons/filter.svg";
import scopeSvg from './icons/scope.svg';
import "./index.css";
import { FilterTogglerType, InlineFilterSchema } from "./types";
import { isToggleable } from "./_utils";

type FilterTogglerProps = {
  schema: InlineFilterSchema;
  value?: string[];
  onChange: (keys: string[], deletedKeys: string[]) => void;
} & FilterTogglerType;

const FilterToggler: React.FC<FilterTogglerProps> = (props) => {
  const {
    schema,
    iconPosition = "before",
    icon = <SVG src={filterSvg} height={15} />,
    text = "Filters",
    selectAllText = "All filters",
    cancelText = "Cancel",
    okText = "Valider",
    value,
    allowSearch = true,
    showCount = false,
    mode = 'default',
    onChange,
  } = props;

  const selectRef = useRef<InputRef>(null);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [isFocused, setIsFocused] = useState<boolean>(false);

    const toggleableFilters = schema.filter(isToggleable);
  const totalToggleableFilters = toggleableFilters.length;
  let selectedCount = (value || []).filter((k) => toggleableFilters.some((f) => Array.isArray(f.name) ? f.name.join("//=") === k : f.name === k)).length;
  if (mode !== 'visible') selectedCount = totalToggleableFilters - selectedCount;
  
  const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);

  const {
    selected,
    noneSelected,
    allSelected,
    partiallySelected,
    unSelect,
    setSelected,
    select,
    unSelectAll,
    selectAll,
  } = useSelections(
    toggleableFilters.map((f) =>
      Array.isArray(f.name) ? f.name.join("//=") : f.name
    ),
    value || []
  );

  useEffect(() => {
    if (popoverIsOpen) setSelected(value || []);
  }, [popoverIsOpen])

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target?.value);

  const onSelect = (key: string) => {
    if (selected.includes(key)) unSelect(key);
    else select(key);
  };

  const onCancel = () => {
    setPopoverIsOpen(false);
    setSelected(value || []);
  };

  const onOk = () => {
    setPopoverIsOpen(false);
    const deletedKeys = value?.filter((k) => !selected.includes(k))?.flatMap(k => k.split("//=")) || [];
    // @ts-ignore
    onChange(selected, deletedKeys);
  };

  const checkAllOption = mode === "visible" ? allSelected : noneSelected;

  let options = toggleableFilters;
  if (search && search.length > 0) {
    options = toggleableFilters.filter((f) => {
      return f.label?.toLowerCase()?.includes(search.toLowerCase()) || f.title?.toLowerCase()?.includes(search.toLowerCase());
    });
  }
  const popoverContent = (
    <>
      {allowSearch && (
        <Input
          ref={selectRef}
          value={search}
          onChange={onSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          addonBefore={(
            <div className="wand__inline-filter__search-input__icon-wrapper">
              <SVG src={scopeSvg} height={15} />
            </div>
          )}
          className={`wand__inline-filter__search-input ${isFocused || !!search ? 'wand__inline-filter__search-input--is-focused' : ''}`}
        />
      )}
      <div className="wand__inline-filter__options-container">
        <div
          key="select-all"
          className={`wand__inline-filter__option ${
            checkAllOption ? "wand__inline-filter__option--is-selected" : ""
          }`}
          onClick={noneSelected ? selectAll : unSelectAll}
        >
          <Space>
            <Checkbox
              indeterminate={partiallySelected}
              checked={checkAllOption}
            />
            {selectAllText}
          </Space>
        </div>
        {options.map((f) => {
          const fieldName = Array.isArray(f.name) ? f.name.join("//=") : f.name;
          let checked = selected?.includes(fieldName)
          if (mode !== 'visible') checked = !checked;
          return (
            <div
              key={fieldName}
              className={`wand__inline-filter__option ${
                checked
                  ? "wand__inline-filter__option--is-selected"
                  : ""
              }`}
              onClick={() => onSelect(fieldName)}
            >
              <Space>
                <Checkbox checked={checked} />
                {f.icon}
                {f.title || f.label}
              </Space>
            </div>
          );
        })}
      </div>
      <div className="wand__inline-filter__footer">
        <Space size="small">
          <Button type="text" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button type="primary" onClick={onOk}>
            {okText}
          </Button>
        </Space>
      </div>
    </>
  );

  return (
    <Popover
      showArrow={false}
      open={popoverIsOpen}
      content={popoverContent}
      placement="bottom"
      onOpenChange={setPopoverIsOpen}
      trigger="click"
      overlayClassName="wand__inline-filter__popover"
    >
      <div className="wand__filter-toggler__button">
        <Space>
          {(icon && iconPosition && iconPosition === "before") && (
            <span className="wand__filter-toggler__icon">
              {icon}
            </span>
          )}
          {text}
          {(icon && iconPosition && iconPosition === "after") && (
            <span className="wand__filter-toggler__icon">
              {icon}
            </span>
          )}
          {showCount && (
            <span className="wand__filter-toggler__count">
              {selectedCount} / {totalToggleableFilters}
            </span>
          )}
        </Space>
      </div>
    </Popover>
  );
};

export default FilterToggler;
