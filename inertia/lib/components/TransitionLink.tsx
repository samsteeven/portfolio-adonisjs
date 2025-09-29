'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link, router } from '@inertiajs/react';
import React, { ComponentProps } from 'react';

interface Props extends ComponentProps<typeof Link> {
  back?: boolean;
}

gsap.registerPlugin(useGSAP);

const TransitionLink = ({ href, onClick, children, back = false, ...rest }: Props) => {
  const { contextSafe } = useGSAP(() => {});

  const handleLinkClick: React.MouseEventHandler<Element> =
    contextSafe?.((e: React.MouseEvent<Element>) => {
      e.preventDefault();

      // Check if elements exist before trying to animate them
      const pageTransitionElement = document.querySelector('.page-transition');
      const pageTransitionInnerElement = document.querySelector('.page-transition--inner');

      // If elements don't exist, navigate directly
      if (!pageTransitionElement || !pageTransitionInnerElement) {
        if (back) {
          window.history.back();
        } else if (href) {
          router.visit(href.toString());
        } else if (onClick) {
          onClick(e as unknown as React.MouseEvent<any>);
        }
        return;
      }

      gsap.set('.page-transition', { yPercent: 100 });
      gsap.set('.page-transition--inner', { yPercent: 100 });

      const tl = gsap.timeline();

      tl.to('.page-transition', {
        yPercent: 0,
        duration: 0.3,
      });

      tl.then(() => {
        if (back) {
          window.history.back();
        } else if (href) {
          router.visit(href.toString());
        } else if (onClick) {
          onClick(e as unknown as React.MouseEvent<any>);
        }
      });
    }) ?? (() => {});

  return (
    <Link href={href} {...rest} onClick={handleLinkClick}>
      {children}
    </Link>
  );
};

export default TransitionLink;