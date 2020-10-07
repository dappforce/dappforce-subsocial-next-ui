import React, { useCallback } from 'react';
import { INFINITE_SCROLL_PAGE_SIZE } from '../../config/ListData.config';
import { getNotifications } from '../utils/OffchainUtils';
import NotAuthorized from '../auth/NotAuthorized';
import { HeadMeta } from '../utils/HeadMeta';
import { useMyAddress } from '../auth/MyAccountContext';
import { Notifications } from './Notification';
import { Loading } from '../utils';
import { InfiniteList } from '../lists/InfiniteList';
import { PageContent } from '../main/PageWrapper';

export const MyNotifications = () => {
  const myAddress = useMyAddress()

  const getNextPage = useCallback(async (page: number, size: number) => {
    if (!myAddress) return undefined

    const offset = (page - 1) * size

    const items = getNotifications(myAddress, offset, INFINITE_SCROLL_PAGE_SIZE);

    return items
  }, [ myAddress ]);

  if (!myAddress) return <NotAuthorized />;

  return <>
    <HeadMeta title='My Notifications' />
    <PageContent >
      <InfiniteList
        title={'My notificatiost'}
        noDataDesc='No notifications for you'
        loadMore={getNextPage}
        customList={({ dataSource }) =>
          dataSource
            ? <Notifications activities={dataSource} />
            : <Loading />
        }
        initialLoad
      />
    </PageContent>
  </>
}

export default MyNotifications
