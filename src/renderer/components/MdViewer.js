import React from 'react';
import ReactMarkdown from 'react-markdown';
import RemarkMath from 'remark-math';
import Latex from 'react-latex';
import ReactJson from 'react-json-view';
import ReactHtmlParser from 'react-html-parser';
import Highlight from 'highlight.js';
import Url from 'url';

import 'highlight.js/styles/solarized-dark.css'
import 'katex/dist/katex.css';
import styles from '../styles/MdViewer.css';

import VizViewer from './VizViewer';

class MdViewer extends React.Component {

  renderLatex(content) {

    return (
      <Latex>
        {content}
      </Latex>
    );
  }

  renderCode(code, lang) {

    code = code || '';

    if (lang === 'json') {

      return this.renderJson(code);
    }

    if (
      lang === 'circo' ||
      lang === 'dot' ||
      lang === 'fdp' ||
      lang === 'neato' ||
      lang === 'osage' ||
      lang === 'twopi'
    ) {

      return this.renderViz(lang, code);
    }

    if (!Highlight.getLanguage(lang)) {

      lang= 'plaintext';
    }

    const html = Highlight.highlight(lang, code).value;

    return (
      <pre>
        <code className={`hljs ${lang}`}>
          {ReactHtmlParser(html)}
        </code>
      </pre>
    );
  }

  renderJson(code) {

    try {

      return (
        <ReactJson
          src={JSON.parse(code)}
          theme="solarized"
          iconStyle="square"
          indentWidth={2}
          style={{ lineHeight: '15px', padding: 5, }}
        />
      );
    } catch {

      return this.renderCode(code, 'plaintext');
    }
  }

  renderViz(lang, code) {

    return (
      <VizViewer
        engine={lang}
        content={code}
      />
    );
  }

  renderImage(alt, src) {

    if (this.props.path) {

      src = Url.resolve('file://' + this.props.path, src);
    }

    return (
      <img src={src} alt={alt} />
    );
  }
  
  render() {

    return (
      <ReactMarkdown
        source={this.props.content}
        plugins={[RemarkMath]}
        renderers={{

          math: (text) =>
            this.renderLatex(`$$${text.value}$$`),
          
          inlineMath: (text) =>
            this.renderLatex(`$${text.value}$`),

          code: ({ language, value }) =>
            this.renderCode(value, language),

          image: ({ alt, src }) =>
            this.renderImage(alt, src),

        }}
      />
    );
  }
}

export default MdViewer;
