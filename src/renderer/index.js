import React from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css/normalize.css';

import MarkdownEditor from './components/MarkdownEditor';

const root = document.createElement('div');

document.body.appendChild(root);

ReactDOM.render(<MarkdownEditor />, root);
