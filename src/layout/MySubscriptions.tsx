// import { SpaceId } from '@subsocial/types/substrate/interfaces';
// import { isEmptyArray, newLogger } from '@subsocial/utils';
// import React, { useCallback, useMemo, useState } from 'react';
// import useSubsocialEffect from '../api/useSubsocialEffect';
// import { useMyAddress } from 'src/components/auth/MyAccountContext';
// import { useSidebarCollapsed } from 'src/components/utils/SideBarCollapsedContext';
// import { InfiniteList } from '../lists/InfiniteList';
// import { Loading } from '../utils';
// import { getPageOfIds } from '../utils/getIds';
// import { useSubsocialApi } from '../utils/SubsocialApiContext';
// import { AllSpacesLink } from './helpers';
// import { buildFollowedItems } from './ListFollowingSpaces';

// const log = newLogger(MySubscriptions.name)

// function MySubscriptions () {
//   const [ followedSpaceIds, setFollowedSpacesIds ] = useState<SpaceId[]>([]);
//   const [ loaded, setLoaded ] = useState(false);
//   const { state: { collapsed } } = useSidebarCollapsed();
//   const { subsocial, isApiReady } = useSubsocialApi()
//   const myAddress = useMyAddress();

//   useSubsocialEffect(({ subsocial, substrate: { api } }) => {
//     if (!myAddress) return;

//     let isSubscribe = true;
//     let unsub: () => any;

//     const subLoadSpacesData = async () => {
//       setLoaded(false);
//       const readyApi = await api;
//       unsub = await readyApi.query.spaceFollows.spacesFollowedByAccount(myAddress, async ids => {
//         if (isSubscribe) {
//           setFollowedSpacesIds(ids as unknown as SpaceId[]);
//           setLoaded(true);
//         }
//       })
//     };

//     subLoadSpacesData().catch(err =>
//       log.error(`Failed to load spaces followed by the current user. ${err}`))

//     return () => {
//       isSubscribe = false;
//       unsub && unsub()
//     };
//   }, [ myAddress ]);

//   const getNextPage = useCallback(async (page: number, size: number) => {
//     if (!isApiReady) return [];

//     const idsOfPage = getPageOfIds(followedSpaceIds, { page, size } as unknown as ParsedUrlQuery)
//     const spacesData = await subsocial.findPublicSpaces(idsOfPage);

//     return spacesData
//   }, [ followedSpaceIds, isApiReady ])

//   if (isEmptyArray(followedSpaceIds)) {
//     return collapsed ? null : (
//       <div className='text-center m-2'>
//         <AllSpacesLink title='Exlore Spaces' />
//       </div>
//     )
//   }

//   return useMemo(() => <InfiniteList
//     initialLoad
//     loadMore={getNextPage}
//     customList={({ dataSource = [] }) => {
//       console.log('dataSource', dataSource)
//       return loaded
//           ? <>{buildFollowedItems(dataSource).map(renderPageLink)}</>
//           : <div className='text-center m-2'><Loading /></div>}
//       }
//   />, [ followedSpaceIds.length, myAddress ] )
// }
