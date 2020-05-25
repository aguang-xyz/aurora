import React from "react";
import HTMLParser from "react-html-parser";
import Viz from "viz.js";
import VizRender from "viz.js/full.render.js";

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

  updateGraph(props) {
    let { engine, content } = props;

    engine = engine || "dot";

    new Viz({
      render: VizRender.render,
      Module: VizRender.Module,
    })
      .renderString(content, { engine })
      .then((graph) => {
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
      prevProps.content !== this.props.content;

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
