import { useState } from 'react'
import './App.css'
import 'antd/dist/antd.css';
import '../lib/index.css'
import { faker } from '@faker-js/faker';
import { UserOutlined } from '@ant-design/icons';
import InlineFilters from '../lib/main';
import dayjs from '../lib/utils/dayjs';
import { InlineFilterSchema } from '../lib/types';


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
  }
]

// @ts-ignore
InlineFilters.configure({
  locale: 'fr',
  selectAllText: 'Sélectionner tout',
  unselectAllText: 'Désélectionner tout',
  okText: 'Filtrer',
  countBadgeThreshold: 1,
})

function App() {
  const [search, setSearch] = useState({ activeOn: '2023-11-12', clients: [] })
  const onReset = () => setSearch({ activeOn: '2023-11-12', clients: [] })

  const onChange = (values: any) => {
    console.log('values', values)
    setSearch(values)
  }

  return (
    <>
      <InlineFilters
        defaultValue={search}
        onReset={onReset}
        resetText="Réinitialiser les filtres"
        toggle={{
          key: 'projects',
          text: 'Filtres',
          selectAllText: 'Tous les fitlres',
          // icon: <UserOutlined />
        }}
        onChange={onChange}
        schema={schema}
      />
    </>
  )
}

export default App
