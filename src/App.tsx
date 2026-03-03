// @ts-nocheck
import { useState } from 'react'
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { faker } from '@faker-js/faker';
import 'antd/dist/antd.css';
import { Button, Descriptions, Input, InputNumber, Radio } from 'antd';

import './App.css'
import '../lib/index.css'
import InlineFilters from '../lib/main';
import { InlineFilterSchema } from '../lib/types';
import { defaultContainerStyle } from '../lib/_utils';

const clientsOptions = faker.helpers.uniqueArray(faker.person.fullName, 30).map((name: string) => ({ value: name, label: name }));

const onLoadKeywordsOptions = async ({ keywords, matchType }: { keywords: string[], matchType: string }) => {
  console.log('Loading keywords options', keywords, matchType)
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return [
    'Harry',
    'Harry Potter',
    'Harry Potter et la chambre des secrets',
    'Hermione',
    'Hermione Granger',
    'Hermione et Harry'
  ]
}

const onLoadAsyncSelectOptions = async (search: string) => {
  console.log('Loading async select options', search);

  // Fetch data from the PokeAPI
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=200`);
  const data = await response.json();

  // Filter and format the results
  const results = data.results
    .filter((pokemon: { name: string }) => pokemon.name.toLowerCase().includes(search.toLowerCase()))
    .map((pokemon: { name: string }) => ({
      value: pokemon.name,
      label: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
    }));

  return results;
};

const marqueByInterest = [
  {
    label: 'Harry potter',
    options: [
      {
        label: 'Harry Potter et la chambre des secrets',
        value: 'Harry Potter et la chambre des secrets'
      },
      {
        label: 'Harry Potter et le prisonnier d\'Azkaban',
        value: 'Harry Potter et le prisonnier d\'Azkaban'
      },
      {
        label: 'Harry Potter et la coupe de feu',
        value: 'Harry Potter et la coupe de feu'
      },
      {
        label: 'Non définit',
        value: null
      }
    ]
  },
  {
    label: 'LOTR',
    options: [
      {
        label: 'Le seigneur des anneaux - La communauté de l\'anneau',
        value: 'Le seigneur des anneaux - La communauté de l\'anneau'
      },
      {
        label: 'Le seigneur des anneaux - Les deux tours',
        value: 'Le seigneur des anneaux - Les deux tours'
      },
      {
        label: 'Le seigneur des anneaux - Le retour du roi',
        value: 'Le seigneur des anneaux - Le retour du roi'
      },
    ]
  }
]

const schema: InlineFilterSchema = [
  {
    name: 'nameEq',
    icon: <UserOutlined />,
    title: 'Nom utilisateur',
    toggleable: false,
    style: {
      width: 300,
    },
    input: {
      type: 'string',
      inputProps: {
        placeholder: 'Rechercher par nom...'
      }
    }
  },
  {
    name: 'clients',
    label: 'Clients',
    title: 'Clients (multiple)',
    input: {
      type: 'select',
      inputProps: {
        options: clientsOptions,
        multiple: true,
        searchPlaceholder: 'Rechercher...',
      }
    }
  },
  {
    name: 'book',
    label: 'Livre',
    input: {
      type: 'select',
      inputProps: {
        options: marqueByInterest,
        multiple: true,
        searchPlaceholder: 'Rechercher un livre...',
      }
    }
  },
  {
    name: 'locales',
    label: 'Langue',
    input: {
      type: 'select',
      inputProps: {
        options: [
          {
            label: 'Anglais',
            value: '66acd108bb43928b44877467'
          },
          {
            label: 'Français',
            value: '66acd108bb43928b44877466'
          }
        ],
        multiple: true,
        countBadgeThreshold: 1,
        searchPlaceholder: 'Rechercher...',
      }
    }
  },
  {
    name: 'activeOn',
    label: 'Actif le',
    toggleable: false,
    input: {
      type: 'date',
      inputProps: {
        format: (value: dayjs.Dayjs) => `Actif le ${value.format('L')}`,
      }
    }
  },
  {
    name: 'priceRange',
    label: 'Fourchette de prix',
    title: 'Sélectionner une fourchette de prix',
    input: {
      type: 'range',
      inputProps: {
        min: 0,
        max: 1000,
        step: 10,
        marks: {
          0: '0€',
          250: '250€',
          500: '500€',
          750: '750€',
          1000: '1000€'
        },
        tipFormatter: (value: number | undefined) => value ? `${value}€` : '',
        allowClear: true
      }
    }
  },
  {
    name: ['startingOn', 'endingOn'],
    title: 'Activité (range)',
    label: 'Actif entre le',
    input: {
      type: 'daterange',
      inputProps: {
        format: 'L',
        placeholder: ['Début', 'Fin']
      }
    }
  },
  {
    name: 'users',
    label: 'Utilisateur',
    icon: <UserOutlined />,
    input: {
      type: 'select',
      inputProps: {
        options: [{ value: 'HP', label: 'Harry Potter' }, { value: 'DM', label: 'Drago Malefoy' }],
        noOptionsFound: 'Aucun utilisateur ne correspond',
        multiple: false
      },
    }
  },
  {
    name: 'onlyMine',
    label: 'Uniquement les miens',
    icon: <UserOutlined />,
    input: {
      type: 'boolean'
    }
  },
  {
    name: 'keywords',
    label: 'Mots clés',
    input: {
      type: 'keywords',
      inputProps: {
        showReset: true,
        defaultMatchType: 'any',
        // @ts-ignore
        loadOptions: onLoadKeywordsOptions,
        i18n: {
          matchText: 'Rechercher',
          allText: 'tous les',
          anyText: 'n\'importe quel',
          keywordsText: 'mots-clés',
          clearText: 'Réinitialiser',
          cancelText: 'Annuler',
          searchText: 'Rechercher'
        }
      }
    }
  },
  {
    name: 'async',
    label: 'Async select',
    input: {
      type: 'asyncSelect',
      inputProps: {
        loadOptions: onLoadAsyncSelectOptions,
        multiple: true,
        searchPlaceholder: 'Rechercher...',
      }
    }
  },
]

// @ts-ignore
InlineFilters.configure({
  locale: 'fr',
  selectAllText: 'Sélectionner tout',
  unselectAllText: 'Désélectionner tout',
  okText: 'Filtrer',
  countBadgeThreshold: 3,
  allowClear: true,
})

function App() {
  const [search, setSearch] = useState({ activeOn: '2023-11-12', clients: [] })
  const onReset = () => setSearch({ activeOn: '2023-11-12', clients: [] })
  const [layout, setLayout] = useState<InlineFiltersLayout>('inline')
  const [flexGap, setFlexGap] = useState(defaultContainerStyle.gap.replace('rem', ''))
  const [locale, setLocale] = useState('fr');
  const [resetText, setResetText] = useState('Réinitialiser les filtres');
  const [okText, setOkText] = useState('Filtrer');

  const onChange = (values: any) => {
    console.log('WILL REFETCH')
    setSearch(values)
  }

  const onVisibleModeChange = (values: any) => {
    console.log('visible values: ', values)
    setSearch(values)
  }

  const configs = [
    {
      title: "Mode cacher des filtres (default)",
      props: {
        toggle: {
          key: 'projects',
          text: 'Filtres',
          selectAllText: 'Tous les filtres',
          showCount: true,
        },
        onChange,
      },
    },
    {
      title: "Mode ajout de filtre",
      props: {
        toggle: {
          position: 'before',
          key: 'projects',
          mode: 'visible',
          text: 'Ajouter un filtre',
          selectAllText: 'Tous les filtres',
          iconPosition: 'before',
          icon: <PlusOutlined />,
          showCount: true,
          defaultValue: ['book'],
        },
        onChange: onVisibleModeChange,
      }
    }
  ]

  const resetInlineProps = () => {
    setLayout('inline')
    setFlexGap(defaultContainerStyle.gap.replace('rem', ''))
    setResetText('Réinitialiser les filtres')
    setOkText('Filtrer')
  }

  return (
    <div>
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 1000, padding: '1rem', borderBottom: '1px solid #ccc', backgroundColor: 'white' }}>
        <Descriptions title="Inline props" extra={<Button type="link" onClick={resetInlineProps}>Reset</Button>}>
          <Descriptions.Item label="locale">
            <Radio.Group value={locale} onChange={(e) => setLocale(e.target.value)}>
              {['fr', 'en', 'es'].map((value) => (
                <Radio key={value} value={value}>{value}</Radio>
              ))}
            </Radio.Group>
          </Descriptions.Item>
          <Descriptions.Item label="layout">
            <Radio.Group value={layout} onChange={(e) => setLayout(e.target.value)}>
              {['inline', 'vertical'].map((value) => (
                <Radio key={value} value={value}>{value}</Radio>
              ))}
            </Radio.Group>
          </Descriptions.Item>
          <Descriptions.Item label="flexGap">
            <InputNumber
              value={flexGap}
              onChange={(value) => setFlexGap(value)}
              addonAfter="rem"
              min={0}
              step={0.1}
            />
          </Descriptions.Item>
          <Descriptions.Item label="resetText">
            <Input value={resetText} onChange={(e) => setResetText(e.target.value)} allowClear placeholder="Réinitialiser les filtres" width={200} />
          </Descriptions.Item>
          <Descriptions.Item label="okText" style={{ paddingLeft: '1rem' }}>
            <Input value={okText} onChange={(e) => setOkText(e.target.value)} allowClear placeholder="Filtrer" width={200} />
          </Descriptions.Item>
        </Descriptions>
      </div>
      <div style={{paddingTop: '10rem'}}>
        {configs.map(({ title, props }, index) => (
          <div
            key={`config-${index}`}
          >
            <h2>{title}</h2>
            <InlineFilters
              defaultValue={search}
              onReset={onReset}
              resetText={resetText}
              config={{
                locale,
                okText: okText,
              }}
              containerStyle={{}}
              flexGap={`${flexGap}rem`}
              layout={layout}
              schema={schema}
              {...props}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
