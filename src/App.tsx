// @ts-nocheck
import { useState } from 'react'
import './App.css'
import 'antd/dist/antd.css';
import '../lib/index.css'
import { faker } from '@faker-js/faker';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import InlineFilters from '../lib/main';
import { InlineFilterSchema } from '../lib/types';


const clientsOptions = faker.helpers.uniqueArray(faker.person.fullName, 30).map((name: string) => ({ value: name, label: name }));

const onLoadKeywordsOptions = async ({ keywords, matchType }: { keywords: string[], matchType: string }) => {
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

  const onChange = (values: any) => {
    console.log('values: ', values)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem'}}>
      {configs.map(({ title, props }, index) => (
        <div
          key={`config-${index}`}
        >
          <h2>{title}</h2>
          <InlineFilters
            defaultValue={search}
            onReset={onReset}
            resetText="Réinitialiser les filtres"
            config={{
              okText: 'Filtrer',
              locale: 'fr',
            }}
            schema={schema}
            {...props}
          />
        </div>
      ))}
    </div>
  )
}

export default App
