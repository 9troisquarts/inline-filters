import { useState } from 'react'
import './App.css'
import 'antd/dist/antd.css';

import { UserOutlined } from '@ant-design/icons';
import InlineFilters from '../lib/InlineFilters';
import dayjs from '../lib/utils/dayjs';
import { InlineFilterSchema } from '../lib/types';

const onLoadKeywordsOptions = async ({ keywords, matchType }: { keywords: string[], matchType: string }) => {
  console.log('Loading keywords options', keywords, matchType)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        'Harry',
        'Harry Potter',
        'Harry Potter et la chambre des secrets',
        'Hermione',
        'Hermione Granger',
        'Hermione et Harry'
      ])
    }, 1000)
  })
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
    name: 'clients',
    label: 'Clients',
    title: 'Clients (multiple)',
    input: {
      type: 'select',
      inputProps: {
        options: [{ value: 'HP', label: 'Harry Potter' }, { value: 'DM', label: 'Drago Malefoy' }],
        multiple: true,
        searchPlaceholder: 'Rechercher...',
        selectAllText: 'Tous les clients',
      }
    }
  },
  {
    name: 'commodityKeywords',
    label: 'Commodités',
    input: {
      type: 'keywords',
      inputProps: {
        // @ts-ignore
        loadOptions: onLoadKeywordsOptions,
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
]

function App() {
  const [search, setSearch] = useState({ activeOn: '2023-11-12' })
  const onReset = () => setSearch({ activeOn: '2023-11-12' })

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
        onChange={setSearch}
        schema={schema}
      />
    </>
  )
}

export default App
