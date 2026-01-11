"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';

interface MarkdownRendererProps {
  content: string;
  ageGroup?: 'young' | 'middle' | 'older';
  learnerId?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, ageGroup = 'middle', learnerId }) => {
  const [organizationTier, setOrganizationTier] = React.useState<string>('free');
  const [loading, setLoading] = React.useState(true);

  // Get age group specific styles
  const getAgeGroupStyles = () => {
    switch (ageGroup) {
      case 'young':
        return {
          fontSize: 'text-lg',
          lineHeight: 'leading-relaxed',
          paragraphSpacing: 'mb-6',
          headingSize: {
            h1: 'text-2xl',
            h2: 'text-xl',
            h3: 'text-lg'
          }
        };
      case 'middle':
        return {
          fontSize: 'text-base',
          lineHeight: 'leading-normal',
          paragraphSpacing: 'mb-4',
          headingSize: {
            h1: 'text-xl',
            h2: 'text-lg',
            h3: 'text-base'
          }
        };
      case 'older':
        return {
          fontSize: 'text-sm',
          lineHeight: 'leading-snug',
          paragraphSpacing: 'mb-3',
          headingSize: {
            h1: 'text-lg',
            h2: 'text-base',
            h3: 'text-sm'
          }
        };
    }
  };

  const styles = getAgeGroupStyles();

  // Fetch organization tier if learnerId is provided
  React.useEffect(() => {
    const fetchOrganizationTier = async () => {
      if (!learnerId) {
        setLoading(false);
        return;
      }

      try {
        // First get learner data to find org_id
        const { data: learnerData, error: learnerError } = await supabase
          .from('learners')
          .select('org_id')
          .eq('id', learnerId)
          .single();

        if (learnerError) throw learnerError;

        // Then get organization tier
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('tier')
          .eq('id', learnerData.org_id)
          .single();

        if (orgError) throw orgError;

        setOrganizationTier(orgData?.tier || 'free');
      } catch (error) {
        console.error('Error fetching organization tier:', error);
        setOrganizationTier('free');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationTier();
  }, [learnerId]);

  // Show ads for free accounts
  const showAds = organizationTier === 'free' && !loading;

  return (
    <div className={cn(
      "prose dark:prose-invert max-w-none",
      styles.fontSize,
      styles.lineHeight
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => (
            <h1
              className={cn(
                "font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700",
                styles.headingSize.h1
              )}
              {...props}
            />
          ),
          h2: ({node, ...props}) => (
            <h2
              className={cn(
                "font-semibold mt-6 mb-3 pb-1 border-b border-gray-100 dark:border-gray-800",
                styles.headingSize.h2
              )}
              {...props}
            />
          ),
          h3: ({node, ...props}) => (
            <h3
              className={cn(
                "font-medium mt-4 mb-2",
                styles.headingSize.h3
              )}
              {...props}
            />
          ),
          p: ({node, ...props}) => (
            <p className={cn("mb-4", styles.paragraphSpacing)} {...props} />
          ),
          code: ({node, className, children, ...props}) => {
            return (
              <code className={cn(className, "bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded")} {...props}>
                {children}
              </code>
            );
          },
          ul: ({node, ...props}) => (
            <ul className="list-disc list-inside space-y-2 mb-4" {...props} />
          ),
          ol: ({node, ...props}) => (
            <ol className="list-decimal list-inside space-y-2 mb-4" {...props} />
          ),
          li: ({node, ...props}) => (
            <li className="ml-4" {...props} />
          ),
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-4" {...props} />
          ),
          img: ({node, ...props}) => (
            <div className="my-4 flex justify-center">
              <img
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ maxHeight: '400px' }}
                {...props}
              />
            </div>
          )
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Ads for free accounts */}
      {showAds && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold">💡</span>
            </div>
            <h4 className="font-semibold text-yellow-800">Upgrade to Premium</h4>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            Unlock all lessons, remove ads, and get premium features for only Ksh 1,071.73/month.
          </p>
          <p className="text-xs text-yellow-600">
            Ask your parent/guardian to upgrade your account to access all content without ads!
          </p>
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer;