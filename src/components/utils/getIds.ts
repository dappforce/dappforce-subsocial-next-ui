import BN from 'bn.js'
import { ZERO } from ".";
import { claimedSpaceIds, lastReservedSpaceId } from "./env";
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from "src/config/ListData.config"
import { nonEmptyStr } from '@subsocial/utils'
import { tryParseInt } from "src/utils"

export const getLastNIds = (nextId: BN, size: number): BN[] => {
  const idsCount = nextId.lten(size) ? nextId.toNumber() - 1 : size

  return new Array<BN>(idsCount)
    .fill(ZERO)
    .map((_, index) =>
      nextId.sub(new BN(index + 1)))
}

type PaginationQuery = {
  page?: number | string | string[]
  size?: number | string | string[]
}

export type ParsedPaginationQuery = {
  page: number
  size: number
}

export const parsePageQuery = (props: PaginationQuery): ParsedPaginationQuery => {
  let { page = DEFAULT_FIRST_PAGE, size = DEFAULT_PAGE_SIZE } = props

  if (nonEmptyStr(page)) {
    page = tryParseInt(page, DEFAULT_FIRST_PAGE)
  }

  if (nonEmptyStr(size)) {
    size = tryParseInt(size, DEFAULT_PAGE_SIZE)
  }

  return {
    page: page as number,
    size: size as number
  }
}

export const getPageOfIds = (ids: BN[], query: PaginationQuery) => {
  const { page, size } = parsePageQuery(query)
  const offset = (page - 1) * size
  const pageOfIds = []

  for (let i = offset; i < offset + size; i++) {
    pageOfIds.push(ids[i])
  }

  return pageOfIds
}

export const approxCountOfPublicSpaces = (nextId: BN) =>
  nextId.subn(lastReservedSpaceId + 1)

const reverseClaimedSpaceIds = claimedSpaceIds.reverse()

export const getReversePageOfSpaceIds = (nextId: BN, query: PaginationQuery) => {
  const { page, size } = parsePageQuery(query)
  const offset = (page - 1) * size
  const nextPageId = nextId.subn(offset)
  let ids = getLastNIds(nextPageId, size)

  const lowId = ids[ids.length - 1]
  // If there is a reserved space id among found ids:
  if (lowId.lten(lastReservedSpaceId)) {
    ids = ids.filter(id => id.gtn(lastReservedSpaceId))
  }

  return ids.length < size
    ? [ ...ids, ...reverseClaimedSpaceIds ]
    : ids
}

export const getLastNSpaceIds = (nextId: BN, size: number): BN[] => {
  const spacesCount = approxCountOfPublicSpaces(nextId)
  const limit = spacesCount.ltn(size) ? spacesCount.toNumber() : size
  let spaceIds = getLastNIds(nextId, limit)

  // We append ids of claimed spaces in case we found
  // less number of the latest space ids than requested via `size` var.
  if (spaceIds.length < size && reverseClaimedSpaceIds.length > 0) {
    const claimedIds = reverseClaimedSpaceIds.slice(0, size - spaceIds.length)
    spaceIds = spaceIds.concat(claimedIds)
  }

  return spaceIds.slice(0, limit)
}
