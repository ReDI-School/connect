import {
  FederalState,
  Language,
  TpDesiredPosition,
  TpEmploymentType,
  TpTechnicalSkill,
  useTpJobseekerDirectoryEntriesFindAllVisibleQuery,
} from '@talent-connect/data-access'
import {
  Checkbox,
  FilterDropdown,
  Icon,
  Pagination,
  SearchField,
} from '@talent-connect/shared-atomic-design-components'
import { LANGUAGES } from '@talent-connect/shared-config'
import { paginateItems } from '@talent-connect/shared-utils'
import {
  desiredPositions,
  desiredPositionsIdToLabelMap,
  employmentTypes,
  employmentTypesIdToLabelMap,
  germanFederalStates,
  topSkills,
  topSkillsIdToLabelMap,
} from '@talent-connect/talent-pool/config'
import { objectEntries } from '@talent-connect/typescript-utilities'
import { useState } from 'react'
import { Columns, Content, Element, Tag } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import {
  ArrayParam,
  BooleanParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params'
import { JobseekerProfileCard } from '../../../components/organisms/JobseekerProfileCard'
import { LoggedIn } from '../../../components/templates'
import {
  useTpCompanyFavouritedJobseekerProfilesQuery,
  useTpCompanyMarkJobseekerAsFavouriteMutation,
  useTpCompanyUnmarkJobseekerAsFavouriteMutation,
} from './BrowseCompany.generated'

const JOBSEEKER_CARDS_PER_PAGE = 12
const PAGINATION_SCROLL_POSITION = 350

export function BrowseCompany() {
  const queryClient = useQueryClient()

  const [currentPageNumber, setCurrentPageNumber] = useState(1)
  const [query, setQuery] = useQueryParams({
    name: withDefault(StringParam, ''),
    desiredLanguages: withDefault(ArrayParam, []),
    desiredPositions: withDefault(ArrayParam, []),
    employmentTypes: withDefault(ArrayParam, []),
    skills: withDefault(ArrayParam, []),
    federalStates: withDefault(ArrayParam, []),
    onlyFavorites: withDefault(BooleanParam, undefined),
    /**
     * Job Fair Boolean Field(s)
     * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
     * Duplicate if there are multiple Job Fairs coming
     */
    // joins25WinterTalentSummit: withDefault(BooleanParam, undefined),
  })
  const name = query.name
  const desiredLanguages = query.desiredLanguages as Language[]
  const desiredPositions = query.desiredPositions as TpDesiredPosition[]
  const employmentTypes = query.employmentTypes as TpEmploymentType[]
  const skills = query.skills as TpTechnicalSkill[]
  const federalStates = query.federalStates as FederalState[]
  const onlyFavorites = query.onlyFavorites

  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  // const joins25WinterTalentSummit = query.joins25WinterTalentSummit

  const jobseekerProfilesQuery =
    useTpJobseekerDirectoryEntriesFindAllVisibleQuery({
      input: {
        name,
        desiredLanguages,
        desiredPositions,
        employmentTypes,
        skills,
        federalStates,
        /**
         * Job Fair Boolean Field(s)
         * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
         * Duplicate if there are multiple Job Fairs coming
         */
        // joins25WinterTalentSummit,
      },
    })

  const favoritedJobseekersQuery =
    useTpCompanyFavouritedJobseekerProfilesQuery()
  const favouriteJobseekerMutation =
    useTpCompanyMarkJobseekerAsFavouriteMutation()
  const unfavouriteJobseekerMutation =
    useTpCompanyUnmarkJobseekerAsFavouriteMutation()

  const jobseekerProfiles =
    jobseekerProfilesQuery?.data?.tpJobseekerDirectoryEntriesVisible

  const isJobseekerFavorite = (profileId) => {
    return favoritedJobseekersQuery.data?.tpCompanyFavoritedJobseekerProfiles?.some(
      (p) => p.favoritedTpJobseekerProfileId === profileId
    )
  }

  // Filter the jobseekerProfiles based on the onlyFavorites flag before pagination
  const filteredJobseekerProfiles = jobseekerProfiles?.filter((profile) => {
    if (!onlyFavorites) return true
    return isJobseekerFavorite(profile.id)
  })

  const { currentItems, totalItems, totalPagesNumber } = paginateItems({
    items: filteredJobseekerProfiles ?? [],
    currentPageNumber,
    itemsPerPage: JOBSEEKER_CARDS_PER_PAGE,
  })

  const handleFavoriteJobseeker = async (tpJobseekerProfileId: string) => {
    const isFavorite =
      favoritedJobseekersQuery.data?.tpCompanyFavoritedJobseekerProfiles
        ?.map((p) => p.favoritedTpJobseekerProfileId)
        ?.includes(tpJobseekerProfileId)
    if (isFavorite) {
      await unfavouriteJobseekerMutation.mutateAsync({
        input: { tpJobseekerProfileId: tpJobseekerProfileId },
      })
    } else {
      await favouriteJobseekerMutation.mutateAsync({
        input: { tpJobseekerProfileId: tpJobseekerProfileId },
      })
    }
    queryClient.invalidateQueries(
      useTpCompanyFavouritedJobseekerProfilesQuery.getKey()
    )
  }

  const resetPaginationPageNumber = () => setCurrentPageNumber(1)

  const toggleOnlyFavoritesFilter = () => {
    setQuery((latestQuery) => ({
      ...latestQuery,
      onlyFavorites: onlyFavorites ? undefined : true,
    }))
    resetPaginationPageNumber()
  }

  const toggleFilters = (filtersArr, filterName, item) => {
    const newFilters = toggleValueInArray(filtersArr, item)
    setQuery((latestQuery) => ({ ...latestQuery, [filterName]: newFilters }))
    resetPaginationPageNumber()
  }

  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next method when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  // const toggle25WinterTalentSummitFilter = () => {
  //   setQuery((latestQuery) => ({
  //     ...latestQuery,
  //     joins25WinterTalentSummit:
  //       joins25WinterTalentSummit === undefined ? true : undefined,
  //   }))
  //   resetPaginationPageNumber()
  // }

  const setName = (value) => {
    setQuery((latestQuery) => ({ ...latestQuery, name: value || undefined }))
    resetPaginationPageNumber()
  }

  const clearFilters = () => {
    setQuery((latestQuery) => ({
      ...latestQuery,
      desiredLanguages: [],
      skills: [],
      desiredPositions: [],
      employmentTypes: [],
      federalStates: [],
      /**
       * Job Fair Boolean Field(s)
       * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
       * Duplicate if there are multiple Job Fairs coming
       */
      // joins25WinterTalentSummit: undefined,
    }))
    resetPaginationPageNumber()
  }

  const shouldShowFilters =
    desiredLanguages.length !== 0 ||
    skills.length !== 0 ||
    desiredPositions.length !== 0 ||
    federalStates.length !== 0 ||
    employmentTypes.length !== 0
  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  // || joins25WinterTalentSummit

  return (
    <LoggedIn>
      <Element
        renderAs="h4"
        textSize={3}
        responsive={{ mobile: { textSize: { value: 4 } } }}
        className="is-flex-grow-1"
        style={{ flexGrow: 1 }}
      >
        Browse our Talent Pool
        {totalItems ? ` (${totalItems})` : ''}
      </Element>
      <Element
        renderAs="p"
        textSize={4}
        responsive={{ mobile: { textSize: { value: 6 } } }}
        className="oneandhalf-bs"
      >
        Search our Jobseeker profiles to find the talent you're looking for.
      </Element>
      <div className="filters">
        <div className="filters-inner">
          <SearchField
            defaultValue={name}
            valueChange={setName}
            placeholder="Search by name"
          />
        </div>
        <div className="filters-inner">
          <FilterDropdown
            items={desiredPositionsOptions}
            className="filters__dropdown"
            label="Desired position"
            selected={desiredPositions}
            onChange={(item) =>
              toggleFilters(desiredPositions, 'desiredPositions', item)
            }
          />
        </div>
        <div className="filters-inner">
          <FilterDropdown
            items={employmentTypesOptions}
            className="filters__dropdown"
            label="Employment Type"
            selected={employmentTypes}
            onChange={(item) =>
              toggleFilters(employmentTypes, 'employmentTypes', item)
            }
          />
        </div>
      </div>
      <div className="filters">
        <div className="filters-inner">
          <FilterDropdown
            items={skillsOptions}
            className="filters__dropdown"
            label="Skills"
            selected={skills}
            onChange={(item) => toggleFilters(skills, 'skills', item)}
          />
        </div>
        <div className="filters-inner">
          <FilterDropdown
            items={germanFederalStatesOptions}
            className="filters__dropdown"
            label="Federal State"
            selected={federalStates}
            onChange={(item) =>
              toggleFilters(federalStates, 'federalStates', item)
            }
          />
        </div>
        <div className="filters-inner">
          <FilterDropdown
            items={desiredLanguagesOptions}
            className="filters__dropdown"
            label="Languages"
            selected={desiredLanguages}
            onChange={(item) =>
              toggleFilters(desiredLanguages, 'desiredLanguages', item)
            }
          />
        </div>
      </div>
      <div className="filters">
        <div className="filters-inner filter-favourites">
          <Checkbox
            name="onlyFavorites"
            checked={onlyFavorites || false}
            handleChange={toggleOnlyFavoritesFilter}
          >
            Only Favorites
          </Checkbox>
          <Icon
            icon="heartFilled"
            className="filter-favourites__icon"
            size="small"
          />
        </div>
        {/*
         * Job Fair Boolean Field(s)
         * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next div when there's an upcoming Job Fair
         * Duplicate if there are multiple Job Fairs coming
         
        <div className="filters-inner">
          <Checkbox
            name="joins25WinterTalentSummit"
            checked={joins25WinterTalentSummit || false}
            handleChange={toggle25WinterTalentSummitFilter}
          >
            Attending ReDI Talent Summit '25 in Berlin
          </Checkbox>
        </div>
        */}
        {/* Next Div is to keep three filters sizing for two checkboxes. Remove if necessary */}
        {/* <div className="filters-inner"></div> */}
      </div>

      <div className="active-filters">
        {shouldShowFilters && (
          <>
            {(skills as string[]).map((catId) => (
              <FilterTag
                key={catId}
                id={catId}
                label={topSkillsIdToLabelMap[catId]}
                onClickHandler={(item) => toggleFilters(skills, 'skills', item)}
              />
            ))}
            {(desiredLanguages as string[]).map((id) => (
              <FilterTag
                key={id}
                id={id}
                label={id}
                onClickHandler={(item) =>
                  toggleFilters(desiredLanguages, 'desiredLanguages', item)
                }
              />
            ))}
            {(desiredPositions as string[]).map((id) => (
              <FilterTag
                key={id}
                id={id}
                label={desiredPositionsIdToLabelMap[id]}
                onClickHandler={(item) =>
                  toggleFilters(desiredPositions, 'desiredPositions', item)
                }
              />
            ))}
            {(employmentTypes as string[]).map((id) => (
              <FilterTag
                key={id}
                id={id}
                label={employmentTypesIdToLabelMap[id]}
                onClickHandler={(item) =>
                  toggleFilters(employmentTypes, 'employmentTypes', item)
                }
              />
            ))}
            {(federalStates as string[]).map((id) => (
              <FilterTag
                key={id}
                id={id}
                label={germanFederalStates[id]}
                onClickHandler={(item) =>
                  toggleFilters(federalStates, 'federalStates', item)
                }
              />
            ))}
            {/*
             * Job Fair Boolean Field(s)
             * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next FilterTag when there's an upcoming Job Fair
             * Duplicate if there are multiple Job Fairs coming
             */}
            {/* {joins25WinterTalentSummit && (
              <FilterTag
                key="redi-winter-talent-summit-2025-filter"
                id="redi-winter-talent-summit-2025-filter"
                label="Attending ReDI Talent Summit '25 in Berlin"
                onClickHandler={toggle25WinterTalentSummitFilter}
              />
            )} */}
            <span className="active-filters__clear-all" onClick={clearFilters}>
              Delete all filters
              <Icon icon="cancel" size="small" space="left" />
            </span>
          </>
        )}
      </div>
      {filteredJobseekerProfiles?.length === 0 ? (
        <Content>
          Unfortunately, we{' '}
          <strong>couldn't find any jobseeker profiles</strong> matching your
          search criteria. You can try adjusting your filters to find more
          profiles.
        </Content>
      ) : (
        <>
          <Columns>
            {currentItems.map((profile) => (
              <Columns.Column
                key={profile.id}
                mobile={{ size: 12 }}
                tablet={{ size: 6 }}
                desktop={{ size: 4 }}
              >
                <JobseekerProfileCard
                  key={profile.id}
                  jobseekerProfile={profile}
                  linkTo={`/app/jobseeker-profile/${profile.id}`}
                  toggleFavorite={handleFavoriteJobseeker}
                  isFavorite={isJobseekerFavorite(profile.id)}
                />
              </Columns.Column>
            ))}
          </Columns>
          {totalItems > JOBSEEKER_CARDS_PER_PAGE && (
            <Pagination
              totalPagesNumber={totalPagesNumber}
              currentPageNumber={currentPageNumber}
              setCurrentPageNumber={setCurrentPageNumber}
              scrollPosition={PAGINATION_SCROLL_POSITION}
            />
          )}
        </>
      )}
    </LoggedIn>
  )
}

const skillsOptions = topSkills.map(({ id, label }) => ({ value: id, label }))
const desiredPositionsOptions = desiredPositions.map(({ id, label }) => ({
  value: id,
  label,
}))
const employmentTypesOptions = employmentTypes.map(({ id, label }) => ({
  value: id,
  label,
}))
const desiredLanguagesOptions = Object.entries(LANGUAGES).map(
  ([value, label]) => ({
    value,
    label,
  })
)
const germanFederalStatesOptions = objectEntries(germanFederalStates).map(
  ([value, label]) => ({
    value,
    label,
  })
)

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
