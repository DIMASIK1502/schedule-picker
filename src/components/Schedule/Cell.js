import React, { Component } from "react";
import "./Cell.scss";

export default class Cell extends Component {
  constructor() {
    super();
    this.cell = React.createRef();
  }

  componentDidMount() {
    this.props.getRef &&
      this.props.getRef({
        ref: this.cell,
        index: this.props.index,
        position: {
          x: this.cell.current.offsetLeft,
          x2: this.cell.current.offsetLeft + this.cell.current.clientWidth,
          y: this.cell.current.offsetTop,
          y2: this.cell.current.offsetTop + this.cell.current.clientHeight
        }
      });
  }
  render() {
    const width = this.props.width ? this.props.width : 25;
    const height = this.props.height ? this.props.height : 48;
    return (
      <div
        ref={this.cell}
        onClick={event => {
          this.props.onClick &&
            this.props.index &&
            this.props.onClick({
              ref: this.cell,
              index: this.props.index,
              key: this.props.rowKey,
              position: {
                x: event.currentTarget.offsetLeft,
                x2:
                  event.currentTarget.offsetLeft +
                  event.currentTarget.clientWidth,
                y: event.currentTarget.offsetTop,
                y2:
                  event.currentTarget.offsetTop +
                  event.currentTarget.clientHeight
              }
            });
        }}
        style={{ width: width, height: height }}
        className={`row-cell  ${
          this.props.className ? this.props.className : ""
        }`}
      ></div>
    );
  }
}
