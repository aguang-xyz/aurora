import React from "react";
import { mermaidAPI } from "mermaid/dist/mermaid";
import HTMLParser from "react-html-parser";
import { v4 as uuid } from "uuid";

class MermaidViewer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graph: null,
      message: null,
    };
  }

  compile(theme, content) {
    theme = theme === "dark" ? "dark" : "default";
    content = content || "";

    try {
      mermaidAPI.initialize({
        startOnLoad: false,
        theme: theme,
      });

      mermaidAPI.render("mermaid", content, (svgGraph) => {
        this.setState({
          graph: svgGraph,
          message: null,
        });
      });
    } catch (err) {
      this.setState({
        message: err.message,
        graph: null,
      });
    }
  }

  componentDidMount() {
    this.compile(this.props.theme, this.props.content);
  }

  componentDidUpdate(prevProps) {
    if (this.props.content != prevProps.content) {
      this.compile(this.props.theme, this.props.content);
    }
  }

  render() {
    if (this.state.message) {
      return (
        <pre>
          <code className="hljs">{this.state.message}</code>
        </pre>
      );
    }

    return (
      <div
        className="MermaidBlock"
        dangerouslySetInnerHTML={{ __html: this.state.graph }}
      />
    );
  }
}

export default MermaidViewer;
