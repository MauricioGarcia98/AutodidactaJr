import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C} from './components';
import {DUR, Galaxy, Intro, ManyToMany, OneToMany, OneToOne, Outro, Star} from './scenes';

const order = [
  [Intro, DUR.intro], [OneToOne, DUR.one], [OneToMany, DUR.many], [ManyToMany, DUR.nm],
  [Star, DUR.star], [Galaxy, DUR.galaxy], [Outro, DUR.outro],
] as const;

export const TOTAL = order.reduce((s, [, d]) => s + d, 0);

export const Video: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {order.map(([Comp, d], i) => {
        const from = at; at += d;
        return <Sequence key={i} from={from} durationInFrames={d}><Comp /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
