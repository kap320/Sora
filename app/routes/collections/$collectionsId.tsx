/* eslint-disable @typescript-eslint/indent */
import { json, MetaFunction } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData, useLocation, NavLink, RouteMatch } from '@remix-run/react';
import { motion } from 'framer-motion';
import { Spacer, Badge } from '@nextui-org/react';

import { useTypedRouteLoaderData } from '~/hooks/useTypedRouteLoaderData';

import { authenticate } from '~/services/supabase';
import { getListDetail } from '~/services/tmdb/tmdb.server';
import i18next from '~/i18n/i18next.server';
import { CACHE_CONTROL } from '~/utils/server/http';

import MediaList from '~/components/media/MediaList';

export const meta: MetaFunction = () => ({
  title: 'Watch Top Trending movies and tv shows free | Sora',
  description:
    'Official Sora website to watch movies online HD for free, Watch TV show & TV series and Download all movies and series FREE',
  keywords:
    'watch free movies, free movies to watch online, watch movies online free, free movies streaming, free movies full, free movies download, watch movies hd, movies to watch',
  'og:url': 'https://sora-anime.vercel.app/trending',
  'og:title': 'Watch Top Trending movies and tv shows free | Sora',
  'og:description':
    'Official Sora website to watch movies online HD for free, Watch TV show & TV series and Download all movies and series FREE',
});

export const loader = async ({ request, params }: LoaderArgs) => {
  const [, locale] = await Promise.all([
    authenticate(request, undefined, true),
    i18next.getLocale(request),
  ]);

  const { collectionsId } = params;
  const cid = Number(collectionsId);

  return json(
    {
      detail: await getListDetail(cid, locale),
    },
    { headers: { 'Cache-Control': CACHE_CONTROL.collection } },
  );
};

export const handle = {
  breadcrumb: (match: RouteMatch) => (
    <>
      <NavLink to="/collections" aria-label="Collections">
        {({ isActive }) => (
          <Badge
            color="primary"
            variant="flat"
            css={{
              opacity: isActive ? 1 : 0.7,
              transition: 'opacity 0.25s ease 0s',
              '&:hover': { opacity: 0.8 },
            }}
          >
            Collections
          </Badge>
        )}
      </NavLink>
      <Spacer x={0.25} />
      <span> ❱ </span>
      <Spacer x={0.25} />
      <NavLink
        to={`/collections/${match.params.collectionsId}`}
        aria-label={match.data?.detail?.name || match.params.collectionsId}
      >
        {({ isActive }) => (
          <Badge
            color="primary"
            variant="flat"
            css={{
              opacity: isActive ? 1 : 0.7,
              transition: 'opacity 0.25s ease 0s',
              '&:hover': { opacity: 0.8 },
            }}
          >
            {match.data?.detail?.name || match.params.collectionsId}
          </Badge>
        )}
      </NavLink>
    </>
  ),
};

const CollectionDetail = () => {
  const { detail } = useLoaderData<typeof loader>();
  const rootData = useTypedRouteLoaderData('root');
  const location = useLocation();

  return (
    <motion.div
      key={location.key}
      initial={{ x: '-10%', opacity: 0 }}
      animate={{ x: '0', opacity: 1 }}
      exit={{ y: '-10%', opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex justify-center flex-col items-center px-3 sm:px-0 pb-16"
    >
      {detail && detail.items && detail.items.length > 0 && (
        <MediaList
          listType="grid"
          showListTypeChangeButton
          items={detail?.items}
          listName={detail?.name}
          genresMovie={rootData?.genresMovie}
          genresTv={rootData?.genresTv}
          virtual
        />
      )}
    </motion.div>
  );
};

export default CollectionDetail;
