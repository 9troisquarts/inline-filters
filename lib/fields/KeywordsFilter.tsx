import React, { useEffect, useState } from 'react';
import { FieldSchema, KeywordsInputProps } from '../types';
import { Badge, Button, Dropdown, Input, MenuProps, Popover, Select, Space, Typography } from 'antd';
import '../index.css';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
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
      matchText,
      allText,
      anyText,
      keywordsText,
      clearText,
      cancelText,
      searchText
    } = {},
  } = (field.input || {}) as KeywordsInputProps;

  const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);
  const [internalValue, setInternalValue] = useState<ValueType>(value || defaultValue)

  const [search, setSearch] = useState<string>('')
  const debouncedSearch = useDebounce(search, { wait: 200 })
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [searching, setSearching] = useState<boolean>(false)

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
        setSearching(true)
        loadOptions({
          keywords: [
            ...internalValue?.keywords || [],
            debouncedSearch
          ],
          matchType: internalValue?.matchType || 'all',
        })
          .then((results: string[]) => {
            setSearching(false)
            setSearchResults(results)
          })
      }
    }
  }, [debouncedSearch])

  const items: MenuProps['items'] = [
    {
      key: '0',
      label: allText || 'all',
      onClick: () => setInternalValue({
        ...internalValue,
        matchType: 'all'
      })
    },
    {
      key: '1',
      label: anyText || 'any',
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
    setSearching(false)
    onChange({ [field.name]: {
      keywords: [],
      matchType: 'all'
    } })
  }

  const onRestoreFilter = () => {
    setInternalValue(value || defaultValue)
    setSearch('')
    setSearchResults([])
    setSearching(false)
  }

  const getFilteredSearchResults = (results: string[]) => {
    return results.filter(result => !internalValue?.keywords?.includes(result))
  }

  const displayMatchType = () => {
    return internalValue?.matchType === 'all' ? allText || 'all' : anyText || 'any'
  }

  const popoverContent = (
    <>
      <Space direction="vertical">
        <Title level={5}>
          { field?.label }
        </Title>
        <div className="wand__inline-filter__match-type">
          <div>
            { matchText || 'Matches' }
          </div>
          <Dropdown
            menu={{ items }}
            trigger={['click']}
          >
            <a onClick={e => e.preventDefault()}>
              <span>
                {displayMatchType()} <DownOutlined />
              </span>
            </a>
          </Dropdown>
          <div>
            { keywordsText || 'of theses keywords :' }
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
              <DeleteOutlined
                onClick={() => setInternalValue({
                  ...internalValue,
                  keywords: internalValue?.keywords?.filter((k, i) => i !== index)
                })}
              />
            </div>
          )) }
        </div>
         <Select
          className={`wand__inline-filter__search-input`}
          showSearch
          placeholder={'Add a keyword'}
          loading={searching}
          onSearch={(s) => {
            setSearch(s || '')
          }}
          onChange={(option) => {
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
          { getFilteredSearchResults(searchResults).map((result, resultIndex) => (
            <Option
              key={resultIndex}
              value={result}
            >
              {displayOptionLabel(result)}
            </Option>
          )) }
        </Select>
        <div className="wand__inline-filter__keywords__popover-footer">
          <div>
            <a onClick={onClearFilter}>
              { clearText || 'Clear' }
            </a>
          </div>
          <div className="wand__inline-filter__keywords__popover-footer-right">
            <Button
              type="default"
              onClick={() => {
                setInternalValue(value || defaultValue)
                setPopoverIsOpen(false)
              }}
            >
              { cancelText || 'Cancel' }
            </Button>
            <Button
              type="primary"
              onClick={() => {
                onChange({ [field.name]: internalValue })
                setPopoverIsOpen(false)
              }}
              disabled={_.isEqual(_.sortBy(value), _.sortBy(internalValue))}
            >
              { searchText || 'Search' }
            </Button>
          </div>
        </div>
      </Space>
    </>
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