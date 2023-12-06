// @ts-nocheck
import { useSelections } from "ahooks";
import { Button, Checkbox, Popover, Space } from "antd";
import React, { useState } from "react";
import SVG from "react-inlinesvg";
import filterSvg from "./icons/filter.svg";
import "./index.css";
import { FilterTogglerType, InlineFilterSchema } from "./types";

type FilterTogglerProps = {
  schema: InlineFilterSchema;
  value?: string[];
  onChange: (keys: string[]) => void;
} & FilterTogglerType;

const FilterToggler: React.FC<FilterTogglerProps> = (props) => {
  const {
    schema,
    icon = <SVG src={filterSvg} height={15} />,
    text = "Filters",
    selectAllText = "All filters",
    cancelText = "Cancel",
    okText = "Valider",
    value,
    onChange,
  } = props;

  const toggleableFilters = schema.filter(
    (f) => f.name && (f.toggleable || f.toggleable === undefined)
  );

  const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);
  const {
    selected: hiddenFilters,
    unSelect,
    setSelected,
    select,
    noneSelected,
    partiallySelected,
    unSelectAll,
    selectAll,
  } = useSelections(
    toggleableFilters.map((f) =>
      Array.isArray(f.name) ? f.name.join("//=") : f.name
    ),
    value || []
  );

  const onSelect = (key: string) => {
    if (hiddenFilters.includes(key)) unSelect(key);
    else select(key);
  };

  const onCancel = () => {
    setPopoverIsOpen(false);
    setSelected(value || []);
  };

  const onOk = () => {
    setPopoverIsOpen(false);
    onChange(hiddenFilters);
  };

  const popoverContent = (
    <>
      <div className="wand__inline-filter__options-container">
        <div
          key="select-all"
          className={`wand__inline-filter__option ${
            noneSelected ? "wand__inline-filter__option--is-selected" : ""
          }`}
          onClick={noneSelected ? selectAll : unSelectAll}
        >
          <Space>
            <Checkbox
              indeterminate={partiallySelected}
              checked={noneSelected}
            />
            {selectAllText}
          </Space>
        </div>
        {toggleableFilters.map((f) => {
          const fieldName = Array.isArray(f.name) ? f.name.join("//=") : f.name;
          return (
            <div
              key={fieldName}
              className={`wand__inline-filter__option ${
                !hiddenFilters?.includes(fieldName)
                  ? "wand__inline-filter__option--is-selected"
                  : ""
              }`}
              onClick={(e) => onSelect(fieldName)}
            >
              <Space>
                <Checkbox checked={!hiddenFilters?.includes(fieldName)} />
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
          {text}
          <span className="wand__filter-toggler__icon">{icon}</span>
        </Space>
      </div>
    </Popover>
  );
};

export default FilterToggler;
