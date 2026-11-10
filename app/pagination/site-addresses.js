const PAGE_SIZES = [25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

// Use the tested plot pagination: clamp the page and show its neighbours with ellipses.
function paginateSiteAddresses(addresses, requestedPage, requestedPageSize, baseUrl) {
  let pageSize = parseInt(requestedPageSize, 10);
  if (!PAGE_SIZES.includes(pageSize)) pageSize = DEFAULT_PAGE_SIZE;

  const total = addresses.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  let page = parseInt(requestedPage, 10);
  if (!(page >= 1)) page = 1;
  if (page > totalPages) page = totalPages;

  const start = (page - 1) * pageSize;
  const pageAddresses = addresses.slice(start, start + pageSize);
  const href = p => `${baseUrl}&perPage=${pageSize}&page=${p}`;

  let pagination = null;
  if (totalPages > 1) {
    const items = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
        items.push({ number: p, href: href(p), current: p === page });
      } else if (items.length && !items[items.length - 1].ellipsis) {
        items.push({ ellipsis: true });
      }
    }
    pagination = { items };
    if (page > 1) pagination.previous = { href: href(page - 1) };
    if (page < totalPages) pagination.next = { href: href(page + 1) };
  }

  return {
    total,
    page,
    pageSize,
    pageSizes: PAGE_SIZES,
    addresses: pageAddresses,
    from: total ? start + 1 : 0,
    to: start + pageAddresses.length,
    pagination
  };
}

module.exports = { paginateSiteAddresses };
