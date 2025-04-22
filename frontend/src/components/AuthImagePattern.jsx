import React from 'react';
import PropTypes from 'prop-types';

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 min-h-screen">
      <div className="max-w-md text-center relative">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-primary ${
                i % 2 === 0 ? "animate-pulse opacity-30" : "opacity-30"
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

AuthImagePattern.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

export default AuthImagePattern;