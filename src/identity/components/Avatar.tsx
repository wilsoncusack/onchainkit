import { Children, useMemo } from 'react';
import { defaultAvatarSVG } from '../../internal/svg/defaultAvatarSVG';
import { defaultLoadingSVG } from '../../internal/svg/defaultLoadingSVG';
import { findComponent } from '../../internal/utils/findComponent';
import { cn } from '../../styles/theme';
import { useAvatar } from '../hooks/useAvatar';
import { useName } from '../hooks/useName';
import type { AvatarReact } from '../types';
import { Badge } from './Badge';
import { DisplayBadge } from './DisplayBadge';
import { useIdentityContext } from './IdentityProvider';

/**
 * Represents an Avatar component that displays either a loading indicator,
 * a default avatar, or a custom avatar based on Ethereum Name Service (ENS).
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO Refactor this component
export function Avatar({
  address = null,
  chain,
  className,
  defaultComponent,
  loadingComponent,
  children,
  ...props
}: AvatarReact) {
  const { address: contextAddress, chain: contextChain } = useIdentityContext();

  const accountAddress = address ?? contextAddress;
  const accountChain = chain ?? contextChain;

  if (!accountAddress) {
    throw new Error(
      'Avatar: an Ethereum address must be provided to the Identity or Avatar component.',
    );
  }

  // The component first attempts to retrieve the ENS name and avatar for the given Ethereum address.
  const { data: name, isLoading: isLoadingName } = useName({
    address: accountAddress,
    chain: accountChain,
  });

  const { data: avatar, isLoading: isLoadingAvatar } = useAvatar(
    { ensName: name ?? '', chain: accountChain },
    { enabled: !!name },
  );

  const badge = useMemo(() => {
    return Children.toArray(children).find(findComponent(Badge));
  }, [children]);

  const defaultAvatar = defaultComponent || defaultAvatarSVG;
  const loadingAvatar = loadingComponent || defaultLoadingSVG;

  // If the data is still loading, it displays a loading SVG.
  if (isLoadingName || isLoadingAvatar) {
    return (
      <div className={cn('h-8 w-8 overflow-hidden rounded-full', className)}>
        {loadingAvatar}
      </div>
    );
  }

  const displayAvatarImg = name && avatar;

  // Otherwise, it displays the custom avatar obtained from ENS.
  return (
    <div className="relative">
      <div
        data-testid="ockAvatar_ImageContainer"
        className={cn('h-8 w-8 overflow-hidden rounded-full', className)}
      >
        {/* biome-ignore lint: alt gets assigned */}
        {displayAvatarImg ? (
          <img
            data-testid="ockAvatar_Image"
            loading="lazy"
            width="100%"
            height="100%"
            decoding="async"
            src={avatar}
            alt={name}
            {...props}
          />
        ) : (
          defaultAvatar
        )}
      </div>
      {badge && (
        <DisplayBadge address={address ?? contextAddress}>
          <div
            data-testid="ockAvatar_BadgeContainer"
            className="-bottom-0.5 -right-0.5 absolute flex h-[15px] w-[15px] items-center justify-center rounded-full bg-transparent"
          >
            <div className="flex h-3 w-3 items-center justify-center">
              {badge}
            </div>
          </div>
        </DisplayBadge>
      )}
    </div>
  );
}
