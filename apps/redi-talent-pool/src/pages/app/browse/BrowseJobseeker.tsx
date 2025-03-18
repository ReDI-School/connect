import {
  FederalState,
  JobseekerProfileStatus,
  TpDesiredPosition,
  TpEmploymentType,
  TpTechnicalSkill,
  useMyTpDataQuery,
  useTpJobListingFindAllVisibleQuery,
} from '@talent-connect/data-access'
import {
  Checkbox,
  FilterDropdown,
  Icon,
  SearchField,
} from '@talent-connect/shared-atomic-design-components'
import {
  desiredPositions,
  desiredPositionsIdToLabelMap,
  employmentTypes,
  employmentTypesIdToLabelMap,
  germanFederalStates,
  jobListingCreatedDate,
  topSkills,
  topSkillsIdToLabelMap,
} from '@talent-connect/talent-pool/config'
import { objectEntries } from '@talent-connect/typescript-utilities'
import { formatDistance } from 'date-fns'
import { useState } from 'react'
import { Columns, Content, Element, Tag } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import { Redirect } from 'react-router-dom'
import {
  ArrayParam,
  BooleanParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params'
import { JobListingCard } from '../../../components/organisms/JobListingCard'
import { LoggedIn } from '../../../components/templates'
import { careerPartnerSortFn } from '../../../utils/sort-job-listings'
import {
  useTpJobListingMarkAsFavouriteMutation,
  useTpJobListingUnfavouriteMutation,
  useTpJobseekerFavouritedJobListingsQuery,
} from './BrowseJobseeker.generated'

export function BrowseJobseeker() {
  const queryClient = useQueryClient()
  const [companyName, setCompanyName] = useState('')
  const myTpData = useMyTpDataQuery()
  const currentJobseekerProfile =
    myTpData.data?.tpCurrentUserDataGet?.tpJobseekerDirectoryEntry
  const favouritedTpJobListingsQuery =
    useTpJobseekerFavouritedJobListingsQuery()
  const markAsFavouriteMutation = useTpJobListingMarkAsFavouriteMutation()
  const unfavouriteMutation = useTpJobListingUnfavouriteMutation()

  const [query, setQuery] = useQueryParams({
    relatedPositions: withDefault(ArrayParam, []),
    idealTechnicalSkills: withDefault(ArrayParam, []),
    employmentType: withDefault(ArrayParam, []),
    federalStates: withDefault(ArrayParam, []),
    onlyFavorites: withDefault(BooleanParam, undefined),
    isRemotePossible: withDefault(BooleanParam, undefined),
    datePosted: withDefault(StringParam, undefined),
    /**
     * Job Fair Boolean Field(s)
     * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
     * Duplicate if there are multiple Job Fairs coming
     */
    // joins25WinterTalentSummit: withDefault(BooleanParam, undefined),
  })
  const relatedPositions = query.relatedPositions as TpDesiredPosition[]
  const idealTechnicalSkills = query.idealTechnicalSkills as TpTechnicalSkill[]
  const employmentType = query.employmentType as TpEmploymentType[]
  const federalStates = query.federalStates as FederalState[]
  const onlyFavorites = query.onlyFavorites
  const isRemotePossible = query.isRemotePossible
  const datePosted = query.datePosted
  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  // const joins25WinterTalentSummit = query.joins25WinterTalentSummit

  const jobListingsQuery = useTpJobListingFindAllVisibleQuery({
    input: {
      relatesToPositions: relatedPositions,
      skills: idealTechnicalSkills,
      employmentTypes: employmentType,
      federalStates,
      isRemotePossible,
      datePosted,
      /**
       * Job Fair Boolean Field(s)
       * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
       * Duplicate if there are multiple Job Fairs coming
       */
      // joins25WinterTalentSummit,
    },
  })

  /**
   * This sorting has to be done here because of several reasons:
   * - Backend currently supports only sorting by one field, which is used for sorting by date
   * - All fetch job listing queries are using one findAll query, which means this sort would have unexpected side effects
   */
  const jobListings = !datePosted
    ? jobListingsQuery.data?.tpJobListings.sort(careerPartnerSortFn)
    : jobListingsQuery.data?.tpJobListings

  const isFavorite = (jobListingId) =>
    favouritedTpJobListingsQuery.data?.tpJobseekerFavoritedJobListings?.some(
      (p) => p.tpJobListingId === jobListingId
    )

  // Filter the jobListings based on the onlyFavorites flag and companyName search query
  const filteredJobListings = jobListings?.filter((jobListing) => {
    const matchCompanyNameSearchQuery = jobListing.companyName
      .toLowerCase()
      .includes(companyName.toLowerCase())

    if (onlyFavorites)
      return matchCompanyNameSearchQuery && isFavorite(jobListing.id)

    return matchCompanyNameSearchQuery
  })

  const handleFavoriteJobListing = async (tpJobListingId: string) => {
    const isFavorite =
      favouritedTpJobListingsQuery.data?.tpJobseekerFavoritedJobListings
        ?.map((p) => p.tpJobListingId)
        ?.includes(tpJobListingId)
    if (isFavorite) {
      await unfavouriteMutation.mutateAsync({
        input: { tpJobListingId: tpJobListingId },
      })
    } else {
      await markAsFavouriteMutation.mutateAsync({
        input: { tpJoblistingId: tpJobListingId },
      })
    }
    queryClient.invalidateQueries(
      useTpJobseekerFavouritedJobListingsQuery.getKey()
    )
  }

  const toggleOnlyFavoritesFilter = () => {
    setQuery((latestQuery) => ({
      ...latestQuery,
      onlyFavorites: onlyFavorites ? undefined : true,
    }))
  }

  const toggleRemoteAvailableFilter = () => {
    setQuery((latestQuery) => ({
      ...latestQuery,
      isRemotePossible: isRemotePossible ? undefined : true,
    }))
  }

  const onSelectDatePosted = (item) => {
    setQuery((latestQuery) => ({
      ...latestQuery,
      datePosted: item ?? undefined,
    }))
  }

  const toggleFilters = (filtersArr, filterName, item) => {
    const newFilters = toggleValueInArray(filtersArr, item)
    setQuery((latestQuery) => ({ ...latestQuery, [filterName]: newFilters }))
  }

  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next method when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  // const toggle25WinterTalentSummitFilter = () =>
  //   setQuery((latestQuery) => ({
  //     ...latestQuery,
  //     joins25WinterTalentSummit:
  //       joins25WinterTalentSummit === undefined ? true : undefined,
  //   }))

  const clearFilters = () => {
    setQuery((latestQuery) => ({
      ...latestQuery,
      relatedPositions: [],
      idealTechnicalSkills: [],
      employmentType: [],
      federalStates: [],
      isRemotePossible: undefined,
      datePosted: undefined,
      /**
       * Job Fair Boolean Field(s)
       * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
       * Duplicate if there are multiple Job Fairs coming
       */
      // joins25WinterTalentSummit: undefined,
    }))
  }

  const shouldShowFilters =
    relatedPositions.length !== 0 ||
    idealTechnicalSkills.length !== 0 ||
    employmentType.length !== 0 ||
    federalStates.length !== 0 ||
    isRemotePossible ||
    datePosted
  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  // || joins25WinterTalentSummit

  // Redirect to homepage if user is not supposed to be browsing yet
  if (
    currentJobseekerProfile &&
    currentJobseekerProfile?.state !== JobseekerProfileStatus.ProfileApproved
  ) {
    return <Redirect to="/" />
  }

  const renderFavoriteCTA = (joblistingId, isFavorite) => {
    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.preventDefault()
      handleFavoriteJobListing(joblistingId)
    }

    return (
      <div className="job-posting-card__favorite" onClick={handleFavoriteClick}>
        <Icon
          icon={isFavorite ? 'heartFilled' : 'heart'}
          className="job-posting-card__favorite__icon"
        />
      </div>
    )
  }

  return (
    <LoggedIn>
      <Element
        renderAs="h4"
        textSize={3}
        responsive={{ mobile: { textSize: { value: 4 } } }}
        className="is-flex-grow-1"
        style={{ flexGrow: 1 }}
      >
        Browse open Job Listings{' '}
        {filteredJobListings?.length ? `(${filteredJobListings.length})` : ''}
      </Element>
      <Element
        renderAs="p"
        textSize={4}
        responsive={{ mobile: { textSize: { value: 6 } } }}
        className="oneandhalf-bs"
      >
        Your profile has been approved and you can now browse job listings
        posted by ReDI's partner companies.
      </Element>
      <div className="filters">
        <div className="filters-inner">
          <SearchField
            defaultValue={companyName}
            valueChange={setCompanyName}
            placeholder="Search by Company Name"
          />
        </div>
        <div className="filters-inner">
          <FilterDropdown
            items={relatedPositionsOptions}
            className="filters__dropdown"
            label="Related Positions"
            selected={relatedPositions}
            onChange={(item) =>
              toggleFilters(relatedPositions, 'relatedPositions', item)
            }
          />
        </div>
        <div className="filters-inner">
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
      <div className="filters">
        <div className="filters-inner">
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
            items={datePostedOptions}
            className="filters__dropdown"
            label="Date Posted"
            onChange={onSelectDatePosted}
            singleSelect
          />
        </div>
      </div>
      <div className="filters">
        <div className="filters-inner">
          <Checkbox
            name="isRemotePossible"
            checked={isRemotePossible || false}
            handleChange={toggleRemoteAvailableFilter}
          >
            Remote Working Possible
          </Checkbox>
        </div>
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
            ReDI Talent Summit '25 in Berlin
          </Checkbox>
        </div>
        */}
        {/* Next Div is to keep three filters sizing for two checkboxes. Remove if necessary */}
        <div className="filters-inner"></div>
      </div>

      <div className="active-filters">
        {shouldShowFilters && (
          <>
            {(relatedPositions as string[]).map((catId) => (
              <FilterTag
                key={catId}
                id={catId}
                label={desiredPositionsIdToLabelMap[catId]}
                onClickHandler={(item) =>
                  toggleFilters(relatedPositions, 'relatedPositions', item)
                }
              />
            ))}
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
            {isRemotePossible && (
              <FilterTag
                key="remote-working-possible"
                id="remote-working-possible"
                label="Remote Working Possible"
                onClickHandler={toggleRemoteAvailableFilter}
              />
            )}
            {datePosted && (
              <FilterTag
                key="date-posted"
                id="date-posted"
                label={
                  datePostedOptions.find((item) => item.value === datePosted)
                    ?.label
                }
                onClickHandler={() => onSelectDatePosted('')}
              />
            )}
            {/*
             * Job Fair Boolean Field(s)
             * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next FilterTag when there's an upcoming Job Fair
             * Duplicate if there are multiple Job Fairs coming
             */}
            {/* {joins25WinterTalentSummit && (
              <FilterTag
                key="redi-winter-talent-summit-2025-filter"
                id="redi-winter-talent-summit-2025-filter"
                label="ReDI Talent Summit '25 in Berlin"
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
      {filteredJobListings?.length === 0 ? (
        <Content>
          Unfortunately, we <strong>couldn't find any job listings</strong>{' '}
          matching your search criteria. You can try adjusting your filters to
          find more opportunities.
        </Content>
      ) : (
        <Columns>
          {filteredJobListings?.map((jobListing) => (
            <Columns.Column key={jobListing.id} size={12}>
              <JobListingCard
                jobListing={jobListing}
                linkTo={`/app/job-listing/${jobListing.id}`}
                renderCTA={() =>
                  renderFavoriteCTA(jobListing.id, isFavorite(jobListing.id))
                }
                timestamp={`Last updated ${formatDistance(
                  new Date(jobListing.updatedAt),
                  new Date(),
                  {
                    addSuffix: true,
                  }
                )}`}
                showPromotedLabel
              />
            </Columns.Column>
          ))}
        </Columns>
      )}
    </LoggedIn>
  )
}

/**
 * Following four function are used to convert the lists in the TP Config
 * to a format that is easier to use in a dropdown in the UI. A possible
 * refactor will remove the need for this conversion.
 */
const skillsOptions = topSkills.map(({ id, label }) => ({ value: id, label }))

const employmentTypeOptions = employmentTypes.map(({ id, label }) => ({
  value: id,
  label,
}))

const relatedPositionsOptions = desiredPositions.map(({ id, label }) => ({
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

const germanFederalStatesOptions = objectEntries(germanFederalStates).map(
  ([value, label]) => ({
    value,
    label,
  })
)

// Adding the 'Any time' option to the date posted filter as undefined cannot be used as a key
const datePostedOptions = [
  { value: null, label: 'Any time' },
  ...objectEntries(jobListingCreatedDate).map(([value, label]) => ({
    value,
    label,
  })),
]
