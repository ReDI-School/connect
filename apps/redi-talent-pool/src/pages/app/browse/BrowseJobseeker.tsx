import {
  FilterDropdown,
  Icon,
} from '@talent-connect/shared-atomic-design-components'
import {
  employmentTypes,
  employmentTypesIdToLabelMap,
  topSkills,
  topSkillsIdToLabelMap,
} from '@talent-connect/talent-pool/config'
import React from 'react'
import { Columns, Element, Tag } from 'react-bulma-components'
import { useHistory } from 'react-router-dom'
import { ArrayParam, useQueryParams, withDefault } from 'use-query-params'
import { JobListingCard } from '../../../components/organisms/JobListingCard'
import { LoggedIn } from '../../../components/templates'
import { useBrowseTpJobListingsQuery } from '../../../react-query/use-tpjoblisting-all-query'

export function BrowseJobseeker() {
  const [query, setQuery] = useQueryParams({
    idealTechnicalSkills: withDefault(ArrayParam, []),
    employmentType: withDefault(ArrayParam, []),
  })
  const { idealTechnicalSkills, employmentType } = query

  const history = useHistory()
  const { data: jobListings } = useBrowseTpJobListingsQuery({
    idealTechnicalSkills,
    employmentType,
  })

  const toggleFilters = (filtersArr, filterName, item) => {
    const newFilters = toggleValueInArray(filtersArr, item)
    setQuery((latestQuery) => ({ ...latestQuery, [filterName]: newFilters }))
  }

  const clearFilters = () => {
    setQuery((latestQuery) => ({
      ...latestQuery,
      idealTechnicalSkills: [],
      employmentType: [],
    }))
  }

  return (
    <LoggedIn>
      <Element
        renderAs="h4"
        textSize={3}
        responsive={{ mobile: { textSize: { value: 7 } } }}
        className="is-flex-grow-1"
        style={{ flexGrow: 1 }}
      >
        Browse open Job Listings
      </Element>
      <Element
        renderAs="p"
        textSize={4}
        responsive={{ mobile: { textSize: { value: 5 } } }}
        className="oneandhalf-bs"
      >
        Your profile has been approved and you can now browse job listings
        posted by ReDI's partner companies.
      </Element>
      <div className="filters">
        <div className="filters-wrapper">
          <FilterDropdown
            items={skillsOptions}
            className="filters__dropdown"
            label="Skills"
            selected={idealTechnicalSkills}
            onChange={(item) =>
              toggleFilters(idealTechnicalSkills, 'idealTechnicalSkills', item)
            }
          />
        </div>
        <div className="filters-wrapper">
          <FilterDropdown
            items={employmentTypeOptions}
            className="filters__dropdown"
            label="Employment type"
            selected={employmentType}
            onChange={(item) =>
              toggleFilters(employmentType, 'employmentType', item)
            }
          />
        </div>
      </div>
      <div className="active-filters">
        {(idealTechnicalSkills.length !== 0 || employmentType.length !== 0) && (
          <>
            {(idealTechnicalSkills as string[]).map((catId) => (
              <FilterTag
                key={catId}
                id={catId}
                label={topSkillsIdToLabelMap[catId]}
                onClickHandler={(item) =>
                  toggleFilters(
                    idealTechnicalSkills,
                    'idealTechnicalSkills',
                    item
                  )
                }
              />
            ))}
            {(employmentType as string[]).map((catId) => (
              <FilterTag
                key={catId}
                id={catId}
                label={employmentTypesIdToLabelMap[catId]}
                onClickHandler={(item) =>
                  toggleFilters(employmentType, 'employmentType', item)
                }
              />
            ))}
            <span className="active-filters__clear-all" onClick={clearFilters}>
              Delete all filters
              <Icon icon="cancel" size="small" space="left" />
            </span>
          </>
        )}
      </div>
      <Columns>
        {jobListings?.map((jobListing) => (
          <Columns.Column mobile={{ size: 12 }} tablet={{ size: 6 }}>
            <JobListingCard
              key={jobListing.id}
              jobListing={jobListing}
              onClick={() => history.push(`/app/job-listing/${jobListing.id}`)}
            />
          </Columns.Column>
        ))}
      </Columns>
    </LoggedIn>
  )
}

const skillsOptions = topSkills.map(({ id, label }) => ({ value: id, label }))
const employmentTypeOptions = employmentTypes.map(({ id, label }) => ({
  value: id,
  label,
}))
interface FilterTagProps {
  id: string
  label: string
  onClickHandler: (item: string) => void
}

const FilterTag = ({ id, label, onClickHandler }: FilterTagProps) => (
  <Tag size="medium" rounded textWeight="bold">
    {label}
    <Icon
      icon="cancel"
      onClick={() => {
        onClickHandler(id)
      }}
      className="active-filters__remove"
    />
  </Tag>
)

export function toggleValueInArray<T>(array: Array<T>, value: T) {
  if (array.includes(value)) return array.filter((val) => val !== value)
  else return [...array, value]
}
