import { RESOURCE_GROUPS } from '../lib/resources'
import { Icon } from '../components/ui/icon'
import { AiAssistantMascot } from '../components/resources/AiAssistantMascot'
import { useResourcesAssistant } from '../hooks/useResourcesAssistant'

export function Resources() {
  const { history, asking, ask } = useResourcesAssistant()

  return (
    <div className="flex flex-col gap-6">
      <AiAssistantMascot history={history} asking={asking} ask={ask} />
      <div className="border-b border-border pb-6">
        <span className="label-caps mb-1 block text-aka">Karate OS</span>
        <h1 className="font-heading-hero text-4xl">Resources</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Official WKF and Karate Canada rulebooks, grading guidelines, and policy documents.
        </p>
      </div>

      <a
        href="https://www.wkf.net/"
        target="_blank"
        rel="noreferrer noopener"
        className="glow-aka card-elevated flex items-center gap-3 border border-aka bg-card p-4 transition-colors duration-150 hover:border-aka"
      >
        <Icon name="sports_martial_arts" className="size-6 flex-shrink-0 text-aka" />
        <div className="flex-1">
          <p className="font-heading text-lg">WKF — Official Site</p>
          <p className="text-xs text-muted-foreground">wkf.net</p>
        </div>
        <Icon name="external_link" className="size-4 flex-shrink-0 text-muted-foreground" />
      </a>

      <div className="flex flex-col gap-8">
        {RESOURCE_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <span className="label-caps text-muted-foreground">{group.title}</span>
            <ul className="flex flex-col gap-2">
              {group.resources.map((resource) => (
                <li key={resource.url + resource.title}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="card-elevated flex items-center gap-3 border border-border bg-card p-4 transition-colors duration-150 hover:border-ring"
                  >
                    <Icon name="file" className="size-5 flex-shrink-0 text-ao" />
                    <span className="flex-1 text-sm font-medium">{resource.title}</span>
                    <Icon
                      name="external_link"
                      className="size-4 flex-shrink-0 text-muted-foreground"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
