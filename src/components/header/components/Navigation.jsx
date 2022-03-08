import React from 'react';
// React Router
import { useNavigate } from 'react-router-dom';
// Recoil Header State
import { useRecoilState } from 'recoil';

// Import Config for the header
import { hierarchicalFacet } from '../../../config/config';
import { linksHeader } from '../../../config/header';
import SelectPersona from '../personnaSelect/SelectPersona';

const Navigation = () => {
  const navigate = useNavigate();
  const [links] = useRecoilState(linksHeader);
  return (
    <ul className="container__header-bottom__links">
      {links.map((link) => {
        return (
          <li
            key={link.url}
            onClick={() => {
              // Hierarchical are extracted from config.js
              if (link.link !== 'All') {
                navigate(`/search`, {
                  state: `${hierarchicalFacet.hierarchicalLvl0}:'${link.filter}'`,
                });
              } else {
                navigate('/search');
              }
            }}
          >
            <p>{link.link}</p>
          </li>
        );
      })}
    </ul>
  );
};

export default Navigation;
