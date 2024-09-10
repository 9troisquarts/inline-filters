import React from 'react';

type BadgeProps = {
  count: number;
  style?: React.CSSProperties;
  className?: string;
};

const Badge: React.FC<BadgeProps> = props => {
  const { count, style, className } = props;

  return (
    <span className={`wand_inline-filter__badge ${className}`} style={style}>
      <span className="wand_inline-filter__badge-count">
        {count}
      </span>
    </span>
  );
}

export default Badge;