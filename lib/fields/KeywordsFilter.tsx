import React, { useEffect, useState } from 'react';
import { FieldSchema, KeywordsInputProps } from '../types';
import { AutoComplete, Badge, Button, Dropdown, MenuProps, Popover, Select, Space, Typography } from 'antd';
import '../index.css';
import { CloseCircleOutlined, DownOutlined } from '@ant-design/icons';
import _ from 'lodash'
import { useDebounce } from 'ahooks';

const { Title } = Typography;
const { Option } = Select

const defaultValue = {
  keywords: [],
  matchType: 'all'
}

type ValueType = {
  keywords: string[]
  matchType: string
}

type FilterProps = {
  field: FieldSchema & { name: string };
  value?: ValueType;
  onChange: (values: {
    [k: string]: ValueType;
  }) => void;
}

const KeywordsFilter: React.FC<FilterProps> = props => {
  const {
    field,
    value,
    onChange
  } = props;

  const {
    inputProps: {
      loadOptions,
      i18n
    } = {},
  } = (field.input || {}) as KeywordsInputProps;

  const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);
  const [internalValue, setInternalValue] = useState<ValueType>(value || defaultValue)

  const [search, setSearch] = useState<string>('')
  const debouncedSearch = useDebounce(search, { wait: 200 })
  const [searchResults, setSearchResults] = useState<string[]>([])

  useEffect(() => {
    onRestoreFilter()
  }, [popoverIsOpen])

  useEffect(() => {
    if (!value) {
      setInternalValue(defaultValue)
    }
  }, [value])

  useEffect(() => {
    if (debouncedSearch !== '' && debouncedSearch !== undefined) {
      if (typeof loadOptions === 'function') {
        loadOptions({
          keywords: [
            ...internalValue?.keywords || [],
            debouncedSearch
          ],
          matchType: internalValue?.matchType || 'all',
        })
          .then((results: string[]) => {
            setSearchResults(results)
          })
      }
    }
  }, [debouncedSearch])

  const items: MenuProps['items'] = [
    {
      key: '0',
      label: i18n?.allText || 'all',
      onClick: () => setInternalValue({
        ...internalValue,
        matchType: 'all'
      })
    },
    {
      key: '1',
      label: i18n?.anyText || 'any',
      onClick: () => setInternalValue({
        ...internalValue,
        matchType: 'any'
      })
    }
  ];

  const displayOptionLabel = (label: string) => {
    const regex = new RegExp(`\\b(${(internalValue?.keywords || [])?.join('|')})\\b`, 'gi')
    const parts = label.split(regex)
    return (
      <React.Fragment>
        {parts.map((partie, index) => (
          regex.test(partie) ? <b key={index}>{partie}</b> : <span key={index}>{partie}</span>
        ))}
      </React.Fragment>
    )
  }

  const onClearFilter = () => {
    setInternalValue(defaultValue)
    setSearch('')
    setSearchResults([])
    onChange({ [field.name]: {
      keywords: [],
      matchType: 'all'
    } })
  }

  const onRestoreFilter = () => {
    setInternalValue(value || defaultValue)
    setSearch('')
    setSearchResults([])
  }

  const getFilteredSearchResults = (results: string[]) => {
    const filteredResults = results?.filter(result => !internalValue?.keywords?.includes(result));
    return [search].concat(filteredResults);
  }

  const displayMatchType = () => {
    return internalValue?.matchType === 'all' ? i18n?.allText || 'all' : i18n?.anyText || 'any'
  }

  const popoverContent = (
    <div className="wand__inline-filter__keywords__popover-content">
      <Title level={5}>
        { field?.label }
      </Title>
      <div className="wand__inline-filter__match-type">
        <div>
          { i18n?.matchText || 'Matches' }
        </div>
        <Dropdown
          menu={{ items }}
          trigger={['click']}
        >
          <a onClick={e => e.preventDefault()}>
            <span>
              {displayMatchType()} <DownOutlined style={{ fontSize: '12px' }} />
            </span>
          </a>
        </Dropdown>
        <div>
          { i18n?.keywordsText || 'of theses keywords :' }
        </div>
      </div>
      <div className="wand__inline-filter__keywords__popover__keyword-list">
        { (internalValue?.keywords)?.map((keyword, index) => (
          <div
            key={index}
            className="wand__inline-filter__keywords__popover__keyword"
          >
            <div>
              {keyword}
            </div>
            <CloseCircleOutlined
              onClick={() => setInternalValue({
                ...internalValue,
                keywords: internalValue?.keywords?.filter((_k, i) => i !== index)
              })}
            />
          </div>
        )) }
      </div>
      <AutoComplete
        className={`wand__inline-filter__search-input`}
        showSearch
        placeholder={'Add a keyword'}
        onSearch={(s) => {
          setSearch(s || '')
        }}
        onSelect={(option) => {
          setSearch('')
          setSearchResults([])
          setInternalValue({
            ...internalValue,
            keywords: [...(internalValue?.keywords || []), option]
          })
        }}
        style={{
          width: '100%',
          marginBottom: 10
        }} 
        value={search}
      >
        { getFilteredSearchResults(searchResults || []).map((result, resultIndex) => (
          <Option
            key={resultIndex}
            value={result}
          >
            {displayOptionLabel(result)}
          </Option>
        )) }
      </AutoComplete>
      <div className="wand__inline-filter__keywords__popover-footer">
        <div>
          <a onClick={onClearFilter}>
            { i18n?.clearText || 'Clear' }
          </a>
        </div>
        <div className="wand__inline-filter__keywords__popover-footer-right">
          <Button
            type="link"
            onClick={() => {
              setInternalValue(value || defaultValue)
              setPopoverIsOpen(false)
            }}
          >
            { i18n?.cancelText || 'Cancel' }
          </Button>
          <Button
            type="primary"
            onClick={() => {
              onChange({ [field.name]: internalValue })
              setPopoverIsOpen(false)
            }}
          >
            { i18n?.searchText || 'Search' }
          </Button>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="wand__inline-filter__keywords">
      <Popover
        showArrow={false}
        open={popoverIsOpen}
        content={popoverContent}
        placement="bottom"
        onOpenChange={setPopoverIsOpen}
        trigger="click"
        overlayClassName="wand__inline-filter__popover"
        overlayStyle={{ width: '500px' }}
      >
        <div className={`wand__inline-filter__filter`}>
          <Space>
            <span className="wand__inline-filter__label">
              {field.label}
            </span>
            { internalValue?.keywords && internalValue?.keywords?.length > 0 ? (
              <Badge className="wand__inline-filter__badge" count={internalValue?.keywords?.length} />
            ) : field.icon }
          </Space>
        </div>
      </Popover>
    </div>
  )
}

export default KeywordsFilter;