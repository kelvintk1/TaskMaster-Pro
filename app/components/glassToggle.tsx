"use client";

import React from "react";
import styled from "styled-components";

interface GlassToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  id?: string; // 👈 add this
}

export default function GlassToggle({
  checked = false,
  onChange,
  id,
}: GlassToggleProps) {
  const toggleId = id || `liquid-toggle-${Math.random()}`; // fallback

  return (
    <StyledWrapper>
      <div className="liquid-toggle">
        <input
          type="checkbox"
          id={toggleId}
          className="liquid-toggle-input"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
        />

        <label htmlFor={toggleId} className="liquid-toggle-label">
          <div className="toggle-well" />
          <div className="toggle-orb" />
        </label>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .liquid-toggle-input {
    display: none;
  }

  .liquid-toggle-label {
    display: flex;
    align-items: center;
    position: relative;
    width: 60px;
    height: 32px;
    cursor: pointer;
  }

  .toggle-well {
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background: linear-gradient(135deg, #101922, #101922);
    box-shadow:
      inset 2px 2px 4px rgba(0, 0, 0, 0.6),
      inset -2px -2px 4px rgba(255, 255, 255, 0.1);
    transition: 0.4s;
  }

  .toggle-orb {
    position: absolute;
    height: 24px;
    width: 24px;
    left: 4px;
    top: 4px;
    border-radius: 50%;
    background: linear-gradient(145deg, #ffffff, #dbeafe);
    box-shadow:
      1px 1px 3px rgba(0, 0, 0, 0.6),
      -1px -1px 3px rgba(255, 255, 255, 0.3);
    transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .liquid-toggle-input:checked + .liquid-toggle-label .toggle-well {
    background: linear-gradient(135deg, #2563eb, #60a5fa);
    box-shadow:
      0 0 10px rgba(37, 99, 235, 0.7),
      0 0 20px rgba(37, 99, 235, 0.5),
      inset 1px 1px 2px rgba(255, 255, 255, 0.4);
  }

  .liquid-toggle-input:checked + .liquid-toggle-label .toggle-orb {
    transform: translateX(28px);
    background: #ffffff;
    box-shadow:
      0 0 8px rgba(255, 255, 255, 0.9),
      0 0 15px rgba(37, 99, 235, 0.6);
  }
`;
