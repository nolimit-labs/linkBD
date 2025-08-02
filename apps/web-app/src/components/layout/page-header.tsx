import { type ReactNode } from 'react';

interface PageHeaderTextProps {
  title: string;
  description?: string;
}

export function PageHeaderText({ title, description }: PageHeaderTextProps) {
  return (
    <div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <div className="bg-background py-2 flex-shrink-0" data-slot="page-header">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <PageHeaderText title={title} description={description} />
          {action && (
            <div className="ml-4">
              {action}
            </div>
          )}
        </div>
        {children && (
          <div>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}