import React from "react";
import HTMLParser from "react-html-parser";
import Viz from "viz.js";
import VizRender from "viz.js/full.render.js";
import { parse } from "node-html-parser";

const ATTRS_FIX_MAP = {
  'fill=\\"#ffffff\\"': 'fill="#0b2a35"',
  'fill=\\"#000000\\"': 'fill="#eee"',
  'stroke=\\"#000000\\" ': 'stroke="#eee"',
};

class VizViewer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graph: null,
      engine: null,
      content: null,
      message: null,
    };
  }

  fixAttributes(obj) {
    if (obj.rawAttrs) {
      if (this.props.theme === "dark") {
        for (let attr in ATTRS_FIX_MAP) {
          obj.rawAttrs = obj.rawAttrs.replace(
            new RegExp(attr, "g"),
            ATTRS_FIX_MAP[attr]
          );
        }
      }

      if (obj.tagName === "svg") {
        const width = obj.rawAttrs.match(/width=\"([\d\.]+)\w+\"/)[1];
        const height = obj.rawAttrs.match(/height=\"([\d\.]+)\w+\"/)[1];

        obj.rawAttrs += ` style="display: inline-block; width: ${width}; height: ${height}"`;
      }
    }

    obj.childNodes.forEach((child) => this.fixAttributes(child));
  }

  transformSvg(originalSvg) {
    try {
      let obj = parse(originalSvg);

      this.fixAttributes(obj);

      return obj.outerHTML;
    } catch (e) {
      console.error("error", e);

      return originalSvg;
    }
  }

  updateGraph(props) {
    let { engine, content } = props;

    engine = engine || "dot";

    new Viz({
      render: VizRender.render,
      Module: VizRender.Module,
    })
      .renderString(content, { engine })
      .then((graph) => {
        graph = this.transformSvg(graph);

        this.setState({ graph, engine, content, message: null });
      })
      .catch((e) => {
        this.setState({
          graph: null,
          engine,
          content,
          message: e.message,
        });
      });
  }

  componentDidMount() {
    this.updateGraph(this.props);
  }

  componentDidUpdate(prevProps) {
    const shouldUpdate =
      prevProps.engine !== this.props.engine ||
      prevProps.content !== this.props.content ||
      prevProps.theme !== this.props.theme;

    if (shouldUpdate) {
      this.updateGraph(this.props);
    }
  }

  render() {
    if (this.state.message) {
      return (
        <pre>
          <code className={`hljs`}>{this.state.message}</code>
        </pre>
      );
    }

    return <div className="VizBlock">{HTMLParser(this.state.graph)}</div>;
  }
}

export default VizViewer;
