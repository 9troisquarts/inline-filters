import React, { useEffect, useState } from 'react';
import { FieldSchema, KeywordsInputProps } from '../types';
import { AutoComplete, Button, Dropdown, MenuProps, Popover, Radio, Select, Space, Typography } from 'antd';
import '../index.css';
import { CloseCircleOutlined, DownOutlined } from '@ant-design/icons';
import _ from 'lodash'
import { useDebounce } from 'ahooks';
import Badge from '../components/Badge';

const { Title } = Typography;
const { Option } = Select

type ValueType = {
  include: {
    keywords: string[];
    matchType: string;
  },
  exclude: {
    keywords: string[];
    matchType: string;
  }
}

type SearchType = 'include' | 'exclude'

type FilterProps = {
  field: FieldSchema<any> & { name: string };
  value?: ValueType;
  onChange: (values: {
    [k: string]: ValueType | undefined
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
      i18n,
      showReset,
      showCancel,
      defaultMatchType = 'all'
    } = {},
  } = (field.input || {}) as KeywordsInputProps;

  const defaultValue = {
    include: {
      keywords: [],
      matchType: defaultMatchType || 'all'
    },
    exclude: {
      keywords: [],
      matchType: defaultMatchType || 'all'
    }
  }

  const [popoverIsOpen, setPopoverIsOpen] = useState<boolean>(false);
  const [internalValue, setInternalValue] = useState<ValueType>(value || defaultValue)
  const totalKeywordsCount = internalValue?.include?.keywords?.length + internalValue?.exclude?.keywords?.length
  const [searchType, setSearchType] = useState<SearchType>('include')  
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
  console.log(internalValue)
  useEffect(() => {
    if (debouncedSearch) {
      if (typeof loadOptions === 'function') {
        loadOptions({
          [searchType]: {
            keywords: [
              ...(internalValue?.[searchType].keywords || []),
              debouncedSearch
          ], matchType: internalValue[searchType].matchType
          }
        }).then((results: string[]) => {
          setSearchResults(results)
        })
      }
    }
  }, [debouncedSearch])

  const items = (searchType: SearchType): MenuProps['items'] => [
    {
      key: '0',
      label: i18n?.allText || 'all',
      onClick: () => setInternalValue({
        ...internalValue,
        [searchType]: {
          ...internalValue[searchType],
          matchType: 'all'
        }
      })
    },
    {
      key: '1',
      label: i18n?.anyText || 'any',
      onClick: () => setInternalValue({
        ...internalValue,
        [searchType]: {
          ...internalValue[searchType],
          matchType: 'any'
        }
      })
    }
  ];

  const displayOptionLabel = (label: string) => {
    const regex = internalValue[searchType].keywords?.length > 0 ? new RegExp(`(${([internalValue[searchType].keywords, search])?.join('|')})`, 'gi') : new RegExp(`(${search})`, 'gi')
    const parts = label?.split(regex).filter(Boolean)
    
    return (
      <React.Fragment>
        {parts.map((word, index) => (
          word.match(regex) ? 
          <b key={index}>
            {word}
          </b> : (
            <span key={index}>
              {word}
            </span>
          )
        ))}
      </React.Fragment>
    )
  }

  const onClearFilter = () => {
    setInternalValue(defaultValue)
    setSearch('')
    setSearchResults([])
    onChange({ [field.name]: undefined })
  }
  const onRestoreFilter = () => {
    setInternalValue(value || defaultValue)
    setSearch('')
    setSearchResults([])
  }

  const getFilteredSearchResults = (results: string[]) => {
    const filteredResults = results?.filter(result => !internalValue[searchType].keywords?.includes(result));
    if(search == '' || search == undefined) {
      return filteredResults
    } else {
      return [search].concat(filteredResults);
    }
  }

  const displayIncludeMatchType = () => {
    return internalValue.include.matchType === 'all' ? i18n?.allText || 'all' : i18n?.anyText || 'any'
  }

  const displayExcludeMatchType = () => {
    return internalValue.exclude.matchType === 'all' ? i18n?.allText || 'all' : i18n?.anyText || 'any'
  }

  const popoverContent = (
    <div className="wand__inline-filter__keywords__popover-content">
      <Title level={5} className="wand__inline-filter__keywords__popover-title">
        { field?.label }
      </Title>
      {internalValue?.include?.keywords?.length > 0 && (
      <>
      <div className="wand__inline-filter__match-type">
        <div>
          { i18n?.includeText || 'Inclus' }
        </div>
        <Dropdown
          menu={{ items: items('include') }}
          trigger={['click']}
        >
          <a onClick={e => e.preventDefault()}>
            <span>
              {displayIncludeMatchType()} <DownOutlined style={{ fontSize: '12px' }} />
            </span>
          </a>
        </Dropdown>
        <div>
          { i18n?.keywordsText || 'of theses keywords :' }
        </div>
      </div>
        <div className="wand__inline-filter__keywords__popover__keyword-list">
          { (internalValue.include.keywords)?.map((keyword, index) => (
            <div
              key={index}
              className="wand__inline-filter__keywords__popover__keyword"
            >
              <ul className="wand__inline-filter__keywords__popover__keyword__list">
                <li>
                  {keyword}
                </li>
              </ul>
              <CloseCircleOutlined
                className="wand__inline-filter__keywords__popover__keyword__close"
                onClick={() => setInternalValue({
                  ...internalValue,
                  include: {
                    ...internalValue.include,
                    keywords: internalValue.include.keywords?.filter((_k, i) => i !== index)
                  }
                })}
              />
            </div>
          )) }
        </div>
        </>
      )}
      {internalValue?.exclude?.keywords?.length > 0 && (
        <>
          <div className="wand__inline-filter__match-type">
            <div>
              { i18n?.excludeText || 'Exclus' }
            </div>
            <Dropdown
              menu={{ items: items('exclude') }}
              trigger={['click']}
            >
              <a onClick={e => e.preventDefault()}>
                <span>
                  {displayExcludeMatchType()} <DownOutlined style={{ fontSize: '12px' }} />
                </span>
              </a>
            </Dropdown>
            <div>
              { i18n?.keywordsText || 'of theses keywords :' }
            </div>
          </div>
          <div className="wand__inline-filter__keywords__popover__keyword-list">
            { (internalValue.exclude.keywords)?.map((keyword, index) => (
              <div
                key={index}
                className="wand__inline-filter__keywords__popover__keyword"
              >
                <ul className="wand__inline-filter__keywords__popover__keyword__list">
                  <li>
                    {keyword}
                  </li>
                </ul>
                <CloseCircleOutlined
                  onClick={() => setInternalValue({
                    ...internalValue,
                    exclude: {
                      ...internalValue.exclude,
                      keywords: internalValue.exclude.keywords?.filter((_k, i) => i !== index)
                    }
                  })}
                />
              </div>
            )) }
          </div>
        </>
      )}
      <Radio.Group
        className="wand__inline-filter__keywords__popover__match-type-radio"
        options={[
          { label: i18n?.includeText || 'Inclus', value: 'include' },
          { label: i18n?.excludeText || 'Exclus', value: 'exclude' }
        ]}
        optionType='default'
        defaultValue={'include'}
        onChange={(e) => setSearchType(e.target.value)}
      />
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
            [searchType]: {
              ...internalValue[searchType],
              keywords: [...internalValue[searchType].keywords, option]
            }
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
        {showReset && (
          <div>
            <a onClick={onClearFilter}>
              { i18n?.clearText || 'Clear' }
            </a>
          </div>
        )}
        <div className="wand__inline-filter__keywords__popover-footer-right">
          {showCancel && (
            <Button
              type="link"
              onClick={() => {
                setInternalValue(value || defaultValue)
                setPopoverIsOpen(false)
              }}
            >
              { i18n?.cancelText || 'Cancel' }
            </Button>
          )}
          <Button
            type="primary"
            disabled={internalValue[searchType].keywords?.length === 0}
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
        <div className={`wand__inline-filter__filter ${totalKeywordsCount > 0 ? 'wand__inline-filter__filter--filled' : ''} ${totalKeywordsCount > 0 || popoverIsOpen ? 'wand__inline-filter__filter--focused' : ''}`}>
          <Space>
            <span className="wand__inline-filter__label">
              {field.label}
            </span>
            { totalKeywordsCount > 0 ? (
              <Badge className="wand__inline-filter__badge" count={totalKeywordsCount} />
            ) : field.icon }
          </Space>
        </div>
      </Popover>
    </div>
  )
}

export default KeywordsFilter;