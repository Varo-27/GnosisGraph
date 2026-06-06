import { useMutation, useQueryClient } from "@tanstack/react-query"

import { patchArticleDetailCache } from "@/entities/article/lib/patchArticleDetailCache"
import { toggleArticleFavorite } from "@/entities/engagement"
import { FAVORITES_QUERY_KEY } from "@/features/favorites"
import useCustomToast from "@/shared/lib/useCustomToast"

export function useToggleFavorite(articleId: number) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: () => toggleArticleFavorite(articleId),
    onSuccess: (response) => {
      patchArticleDetailCache(queryClient, articleId, {
        is_favorited: response.is_favorited,
      })
      void queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
      showSuccessToast(
        response.is_favorited
          ? "Artículo guardado en favoritos"
          : "Artículo eliminado de favoritos",
      )
    },
    onError: () => showErrorToast("No se pudo actualizar el favorito"),
  })

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
