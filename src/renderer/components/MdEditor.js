import "codemirror/keymap/sublime";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/solarized.css";
import "codemirror/theme/mdn-like.css";
import "../libs/MdEditorMode";

import CodeMirror from "codemirror/lib/codemirror";
import React from "react";

const CM_OPTIONS = {
  indentUnit: 2,
  tabSize: 2,
  indentWithTabs: false,

  lineNumbers: true,
  lineWrapping: true,
  theme: "solarized dark",

  scrollbarStyle: null,
  mode: "md-editor",

  keyMap: "sublime",
};

class MdEditor extends React.Component {
  constructor(props) {
    super(props);

    this.textareaRef = React.createRef();
  }

  getTheme() {
    switch (this.props.theme) {
      case "light":
        return "mdn-like";

      case "dark":
        return "solarized dark";
    }
  }

  getOptions() {
    return { ...CM_OPTIONS, theme: this.getTheme() };
  }

  componentDidMount() {
    if (this.textareaRef.current) {
      this.codemirror = CodeMirror.fromTextArea(
        this.textareaRef.current,
        this.getOptions()
      );

      this.codemirror.on("change", (x) => {
        if (this.props.onChange) {
          this.props.onChange(x.getValue());
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.theme != this.props.theme) {
      if (this.codemirror) {
        this.codemirror.setOption("theme", this.getTheme());
      }
    }
  }

  setValue(value) {
    if (this.codemirror) {
      this.codemirror.setValue(value);
    }
  }

  render() {
    return (
      <textarea ref={this.textareaRef} defaultValue={this.props.defaultValue} />
    );
  }
}

export default MdEditor;
