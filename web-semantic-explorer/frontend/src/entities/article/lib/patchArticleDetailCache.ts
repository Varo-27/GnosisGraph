import type { QueryClient } from "@tanstack/react-query"
import { articleDetailQueryKey } from "../model/queryKeys"
import type { ArticleDetail } from "../model/types"

export function patchArticleDetailCache(
  queryClient: QueryClient,
  articleId: number,
  patch: Partial<ArticleDetail>,
) {
  const detailKey = articleDetailQueryKey(articleId)
  queryClient.setQueryData<ArticleDetail>(detailKey, (current) =>
    current ? { ...current, ...patch } : current,
  )
}
