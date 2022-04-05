// This is the Search Results Page that you'll see on a phone screen

import { useState } from 'react';
// eslint-disable-next-line import/order
import { Configure, Index } from 'react-instantsearch-dom';

import { useLocation } from 'react-router-dom';

// import framer motion
import { motion } from 'framer-motion';

import { framerMotionPage } from '@/config/animationConfig';

// Recoil state to directly access results
import { useRecoilValue } from 'recoil';

// Import Persona State from recoil
import { personaSelectedAtom } from '@/config/personaConfig';

import { shouldHaveStats, shouldHaveInjectedHits } from '@/config/featuresConfig';
import { sortBy } from '@/config/sortByConfig';
import { queryAtom } from '@/config/searchboxConfig';

// Import Components
import CustomClearRefinements from '@/components/facets/ClearRefinement';
import CustomCurrentRefinements from '@/components/facets/CurrentRefinement';
import CustomHitsComponent from '@/components/hits/CustomHits';
import NoCtaCard from '@/components/hits/NoCtaCard';
import { Hit } from '@/components/hits/Hits';
import InfluencerCard from '@/components/hits/InfluencerCard';
import SalesCard from '@/components/hits/SalesCard';
import CustomSortBy from '@/components/searchresultpage/SortBy';
import { CustomStats } from '@/components/searchresultpage/Stats';
import { InjectedHits } from '@/components/searchresultpage/injected-hits';
import FacetsMobile from '@/components/facets/facetsMobile/FacetsMobile';
import { ChevronRight, ChevronLeft } from '@/assets/svg/SvgIndex';

import { indexNames } from '@/config/algoliaEnvConfig';

import { hitsPerPage } from '@/config/hitsConfig';

// Import Config File
import { customDataByType } from '@/utils';

const SrpMobile = () => {
  // Recoil & React states
  const [injected, setInjected] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const queryState = useRecoilValue(queryAtom);

  // Define Stat Const
  const stats = useRecoilValue(shouldHaveStats);
  const hitsPerPageNotInjected = hitsPerPage.numberNotInjected;
  const hitsPerPageInjected = hitsPerPage.numberInjected;
  const shouldInjectContent = useRecoilValue(shouldHaveInjectedHits);

  // Define Price Sort By
  const { value: priceSortBy, labelIndex: labelItems } = sortBy;

  // Get states of React Router
  const { state } = useLocation();

  // Persona
  const userToken = useRecoilValue(personaSelectedAtom);

  return (
    <div className="srp-container-mobile">
      <div
        className={`${
          isMenuOpen ? 'facets-slider-active' : 'facets-slider-inactive'
        } facets-slider`}
        onClick={() => {
          setIsMenuOpen(!isMenuOpen);
        }}
      >
        {isMenuOpen ? <ChevronRight /> : <ChevronLeft />}
        <p>Filters</p>
      </div>
      <FacetsMobile isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <motion.div
        className="srp-container__hits"
        variants={framerMotionPage}
        initial={framerMotionPage.initial}
        animate={framerMotionPage.animate}
        exit={framerMotionPage.exit}
        transition={framerMotionPage.transition}
      >
        <div className="srp-container__stats-sort">
          {stats && <CustomStats />}
          {priceSortBy && (
            <CustomSortBy
              items={labelItems}
              defaultRefinement={indexNames.mainIndex}
            />
          )}
        </div>

        <div className="refinement-container">
          <CustomCurrentRefinements />
          <CustomClearRefinements />
        </div>
        <Configure
          hitsPerPage={injected ? hitsPerPageInjected : hitsPerPageNotInjected}
          analytics={false}
          userToken={userToken}
          enablePersonalization={true}
          filters={state ? state : ''}
          query={queryState}
        />
        <Index indexName={indexNames.injectedContentIndex}>
          <Configure hitsPerPage={1} page={0} />
        </Index>
        {shouldInjectContent ? (
          <InjectedHits
            hitComponent={Hit}
            slots={({ resultsByIndex }) => {
              const indexValue = indexNames.mainIndex;
              const { noCta, salesCard } = customDataByType(
                resultsByIndex?.[indexValue]?.userData
              );
              // eslint-disable-next-line no-lone-blocks
              {
                // eslint-disable-next-line no-unused-expressions
                salesCard && setInjected(true);
              }
              return [
                {
                  getHits: () => [noCta],
                  injectAt: noCta ? noCta.position : null,
                  slotComponent: NoCtaCard,
                },
                {
                  getHits: () => [salesCard],
                  injectAt: salesCard ? salesCard.position : null,
                  slotComponent: SalesCard,
                },
                {
                  injectAt: ({ position }) => position === 2,
                  // eslint-disable-next-line no-shadow
                  getHits: ({ resultsByIndex }) => {
                    setInjected(true);
                    return resultsByIndex[indexNames.injectedContentIndex]
                      ? resultsByIndex[indexNames.injectedContentIndex].hits || []
                      : [];
                  },
                  slotComponent: InfluencerCard,
                },
              ];
            }}
          />
        ) : (
          <CustomHitsComponent />
        )}
      </motion.div>
    </div>
  );
};

export default SrpMobile;
