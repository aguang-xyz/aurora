import 'highlight.js/styles/solarized-dark.css';
import 'katex/dist/katex.css';

import Electron from 'electron';
import Highlight from 'highlight.js';
import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import ReactJson from 'react-json-view';
import Latex from 'react-latex';
import ReactMarkdown from 'react-markdown';
import RemarkMath from 'remark-math';
import Url from 'url';
import ReactEmoji from 'react-emoji';

import styles from '../styles/MdViewer.css';

import VizViewer from './VizViewer';

Highlight.configure({
  tabReplace: '  ',
  useBR: true,
});

class MdViewer extends React.Component {
  renderLatex(content, block = false) {
    if (block) {
      return (
        <div>
          <Latex>{content}</Latex>
        </div>
      );
    }

    return <Latex>{content}</Latex>;
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
      lang = 'plaintext';
    }

    const html = Highlight.fixMarkup(Highlight.highlight(lang, code).value);

    return (
      <pre>
        <code className={`hljs ${lang}`}>{ReactHtmlParser(html)}</code>
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
          style={{ lineHeight: '15px', padding: 5 }}
        />
      );
    } catch {
      return this.renderCode(code, 'plaintext');
    }
  }

  renderViz(lang, code) {
    return <VizViewer engine={lang} content={code} />;
  }

  renderImage(alt, src) {
    if (this.props.path) {
      src = Url.resolve('file://' + this.props.path, src);
    }

    return <img src={src} alt={alt} />;
  }

  renderText(text) {
    return (
      <span>
        {ReactEmoji.emojify(text, { attributes: { className: 'Emoji' } })}
      </span>
    );
  }

  openLink(href) {
    if (Electron) {
      Electron.shell.openExternal(href);
    } else {
      window.open(href);
    }
  }

  renderLink(href, children) {
    return (
      <a href="#" onClick={() => this.openLink(href)}>
        {children}
      </a>
    );
  }

  render() {
    return (
      <ReactMarkdown
        source={this.props.content}
        plugins={[RemarkMath]}
        renderers={{
          math: (text) => this.renderLatex(`$$${text.value}$$`, true),

          inlineMath: (text) => this.renderLatex(`$${text.value}$`),

          code: ({ language, value }) => this.renderCode(value, language),

          image: ({ alt, src }) => this.renderImage(alt, src),

          text: ({ value }) => this.renderText(value),

          link: ({ href, children }) => this.renderLink(href, children),
        }}
      />
    );
  }
}

export default MdViewer;
