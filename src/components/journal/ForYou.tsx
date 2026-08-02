import { WELLNESS_ARTICLES } from '../../lib/wellnessArticles'
import { Icon } from '../ui/icon'

export function ForYou() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-heading text-lg">For you</p>
        <p className="text-xs text-muted-foreground">On athlete burnout, stress, and bouncing back from setbacks.</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {WELLNESS_ARTICLES.map((article) => (
          <a
            key={article.url}
            href={article.url}
            target="_blank"
            rel="noreferrer noopener"
            className="card-elevated flex min-w-[220px] max-w-[220px] flex-shrink-0 flex-col gap-2 border border-border bg-card p-4 transition-colors duration-150 hover:border-ring"
          >
            <Icon name="file" className="size-4 text-ao" />
            <p className="text-sm font-medium leading-snug">{article.title}</p>
            <p className="label-caps mt-auto text-muted-foreground">{article.source}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
