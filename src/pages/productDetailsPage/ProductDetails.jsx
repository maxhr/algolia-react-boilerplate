// Page for Product details, after clicking on an item from search
// It contains both Recommend components
import { lazy, useEffect, useState } from 'react';

// Recommend
import {
  useFrequentlyBoughtTogether,
  useRelatedProducts,
} from '@algolia/recommend-react';

// Slider for recommend
import { HorizontalSlider } from '@algolia/ui-components-horizontal-slider-react';

// styles for Recommend HorizontalSlider
import '@algolia/ui-components-horizontal-slider-theme';

// framer-motion
import { motion } from 'framer-motion';
// Import Lodash functions
import get from 'lodash/get';
// React Router
import { useLocation, useNavigate } from 'react-router-dom';
// State Manage Recoil
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

// SVG & components
import { ChevronLeft, CartPicto } from '@/assets/svg/SvgIndex';
import Price from '@/components/hits/components/Price.jsx';
import RelatedItem from '@/components/recommend/relatedItems/RelatedProducts';
// In case of img loading error
import * as placeHolderError from '@/assets/logo/logo.webp';
// Configuration
import {
  mainIndex,
  recommendClient,
  searchClient,
} from '@/config/algoliaEnvConfig';
import {
  framerMotionPage,
  framerMotionTransition,
} from '@/config/animationConfig';
import { addToCartSelector, cartOpen } from '@/config/cartFunctions';
import { alertContent, isAlertOpen } from '@/config/demoGuideConfig';
import {
  shouldHaveFbtProducts,
  shouldHaveRelatedProducts,
} from '@/config/featuresConfig';
import { shouldHaveOpenFederatedSearch } from '@/config/federatedConfig';
import { hitAtom, hitsConfig, PDPHitSections } from '@/config/hitsConfig';

// Used to send insights event on add to cart
import { personaSelectedAtom } from '@/config/personaConfig';

// Custom hooks
import { windowSize } from '@/hooks/useScreenSize';

// Send an insights event to algolia
// import useSendAlgoliaEvent from '@/hooks/useSendAlgoliaEvent';

//Import scope SCSS
import './SCSS/productDetails.scss';

// Import and use translation
import { useTranslation } from 'react-i18next';
import { useHits } from 'react-instantsearch-hooks-web';

const ProductDetails = () => {
  const { sendEvent } = useHits();

  const [addToCartIsClicked, setAddToCartIsClicked] = useState(false);

  // location in order to access current objectID
  const location = useLocation();

  // access the main index from recoil state
  const indexName = useRecoilValue(mainIndex);

  // access the hit component from recoil state
  const [hit, setHit] = useRecoilState(hitAtom);

  const [readyToLoad, setReadyToLoad] = useState(false);

  // current Object ID from URL
  const currentObjectID = location.pathname.split('/')[3];

  // if there is no stored hit
  useEffect(() => {
    if (Object.keys(hit).length === 0) {
      // initialise the API client
      const index = searchClient.initIndex(indexName);

      // Find the hit by Object ID through Algolia
      index
        .search('', { facetFilters: `objectID:${currentObjectID}` })
        .then(({ hits }) => {
          if (hits.length && hits.length > 0) {
            // Set the hit atom
            setHit(hits[0]);
            setReadyToLoad(true);
          }
        });
    } else {
      setReadyToLoad(true);
    }
  }, []);

  const shouldHaveRelatedProductsValue = useRecoilValue(
    shouldHaveRelatedProducts
  );

  const shouldHaveFbtProductsValue = useRecoilValue(shouldHaveFbtProducts);

  // Close federated and set value false for return without it
  const setFederatedOpen = useSetRecoilState(shouldHaveOpenFederatedSearch);

  useEffect(() => {
    setFederatedOpen(false);
  }, []);

  // navigate is used by react router
  const navigate = useNavigate();

  const { isDesktop } = useRecoilValue(windowSize);

  const setAddToCartAtom = useSetRecoilState(addToCartSelector);

  // Get hit attribute from config file
  const {
    objectID,
    image,
    productName,
    brand,
    sizeFilter,
    colour,
    colourHexa,
    price: priceForTotal,
  } = hitsConfig;

  const hexaCode = get(hit, colourHexa)?.split(';')[1];

  // Import const translation
  // Use the translator
  const { t } = useTranslation('translation', {
    keyPrefix: 'pdp',
  });

  let fbtRecommendationsProducts;
  let relatedRecommendationsProducts;

  if (shouldHaveFbtProductsValue) {
    const { recommendations } = useFrequentlyBoughtTogether({
      recommendClient,
      indexName,
      objectIDs: [currentObjectID],
    });
    fbtRecommendationsProducts = recommendations;
  }

  if (shouldHaveRelatedProductsValue) {
    const { recommendations } = useRelatedProducts({
      recommendClient,
      indexName,
      objectIDs: [currentObjectID],
    });
    relatedRecommendationsProducts = recommendations;
  }

  return (
    // Product Display Page parent container, including attributes for framer motion
    <div
      className={`${!isDesktop ? 'pdp-mobile' : ''} pdp`}
      variants={framerMotionPage}
      initial={framerMotionPage.initial}
      animate={framerMotionPage.animate}
      exit={framerMotionPage.exit}
      transition={framerMotionPage.transition}
    >
      <div className={`${!isDesktop ? 'pdp-mobile__wrapper' : 'pdp__wrapper'}`}>
        <div
          className={`${!isDesktop ? 'pdp-mobile__backBtn' : 'pdp__backBtn'}`}
          onClick={() => {
            navigate('/search');
          }}
        >
          <ChevronLeft />
          <p>{t('buttonBack')}</p>
        </div>
        <div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            transition: { framerMotionTransition },
          }}
          className={`${!isDesktop ? 'pdp-mobile__left' : 'pdp__left'}`}
        >
          <div
            className="container"
            initial={{
              height: '100%',
              opacity: 0,
            }}
            animate={{
              x: 0,
              width: '100%',
              opacity: 1,
              transition: { delay: 0.2, framerMotionTransition },
            }}
          >
            <div className="imageWrapper">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={framerMotionTransition}
                src={get(hit, image)}
                alt=""
                onError={(e) => (e.currentTarget.src = placeHolderError)}
              />
            </div>
          </div>
        </div>
        <div className={`${!isDesktop ? 'pdp-mobile__right' : 'pdp__right'}`}>
          <div
            className="pdp__right__infos"
            initial={{
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
              transition: { delay: 0.5, framerMotionTransition },
            }}
          >
            {PDPHitSections.brand && <p className="brand">{get(hit, brand)}</p>}
            {PDPHitSections.productName && (
              <p className="name">{get(hit, productName)}</p>
            )}
            {PDPHitSections.colour && (
              <div className="color">
                {hexaCode ? (
                  <div
                    style={{
                      backgroundColor: hexaCode,
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                    }}
                  ></div>
                ) : (
                  ''
                )}
                <p>{get(hit, colour)}</p>
              </div>
            )}

            {PDPHitSections.sizeFilter && get(hit, sizeFilter)?.length > 0 && (
              <div className="sizes">
                <p>{t('availableSize')}</p>
                <div className="sizeList">
                  {get(hit, sizeFilter).map((size, i) => (
                    <div className="size" key={i}>
                      <p>{size}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Add to cart button which sends an Insights API call to Algolia but only if there is no size filter */}

            {PDPHitSections.price && (
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                  transition: { delay: 1, framerMotionTransition },
                }}
                className="price"
              >
                <Price hit={hit} />
              </motion.p>
            )}
            {!PDPHitSections.sizeFilter && (
              <motion.button
                className={
                  addToCartIsClicked
                    ? 'add-to-cart add-to-cart-active'
                    : 'add-to-cart'
                }
                onClick={() => {
                  setAddToCartAtom(hit);
                  setAddToCartIsClicked(true);
                  setTimeout(() => setAddToCartIsClicked(false), 300);
                  // Send event conversion to Algolia API
                  sendEvent('conversion', hit, 'PDP: Add to cart');
                }}
              >
                <CartPicto />
                <p>{t('addToCartButton')}</p>
              </motion.button>
            )}
          </div>
        </div>
      </div>
      {/* Render two Recommend components - Related Products, Frequently Bought Together */}
      {readyToLoad && (
        <div
          className="recommend"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            transition: { delay: 1, framerMotionTransition },
          }}
        >
          {shouldHaveRelatedProductsValue &&
            relatedRecommendationsProducts.length > 0 && (
              <div>
                <h3 className="title">{t('relatedTitle')}</h3>
                <HorizontalSlider
                  itemComponent={RelatedItem}
                  items={relatedRecommendationsProducts}
                />
              </div>
            )}
          {shouldHaveFbtProductsValue && fbtRecommendationsProducts.length > 0 && (
            <div>
              <h3 className="title">{t('fbtTitle')}</h3>
              <HorizontalSlider
                itemComponent={RelatedItem}
                items={fbtRecommendationsProducts}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
