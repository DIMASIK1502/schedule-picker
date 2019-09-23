import React, { Component } from "react";
import Cell from "./Cell";
import styler from "stylefire";
import moment from "moment";
import "./Row.scss";

const CELL_WIDTH = 25;
const POPOVER_ENABLED = false;
const CELL_PADDING_TOP = 0;
const CELL_PADDING_BOTTOM = 0;
const CELL_PADDING_LEFT = 1;
const CELL_PADDING_RIGHT = 1;

export default class Row extends Component {
  constructor() {
    super();

    this.row = React.createRef();
    this.popover = React.createRef();
    this.layer = React.createRef();
    this._listener = null;
    this.cells = [];
    this.state = {
      range: [8, 24],
      firstPoint: null,
      secondPoint: null,
      blockedPanels: null,
      leftX: null,
      rightX: null
    };
  }
  componentDidUpdate(oldProps, oldState) {
    if (oldProps.active === true && this.props.active === false) {
      this.setState({
        firstPoint: null,
        secondPoint: null,
        leftX: null,
        rightX: null
      });
    }
  }
  getDateFromCell = (date, cell) => {
    return !cell
      ? null
      : moment(date).set({
          hours: Math.floor(this.state.range[0] + ((cell.index - 1) * 30) / 60),
          minutes: ((cell.index - 1) * 30) % 60,
          seconds: 0
        });
  };

  getMin = (cell, blockedPanels) => {
    if (blockedPanels.length) {
      const blocked = blockedPanels.filter(a => a.x <= cell.position.x);

      if (blocked.length) {
        return blocked.find(x => x.x2 === Math.max(...blocked.map(a => a.x2)));
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
  getMax = (cell, blockedPanels) => {
    if (blockedPanels.length) {
      const blocked = blockedPanels.filter(a => a.x >= cell.position.x2);

      if (blocked.length) {
        return blocked.find(x => x.x2 === Math.min(...blocked.map(a => a.x2)));
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
  handleOnCellClick = async cell => {
    const { firstPoint, secondPoint, blockedPanels } = this.state;
    const { startPoint, endPoint } = this.props;
    if (!startPoint && !endPoint) {
      if (!firstPoint) {
        this.props.onCellClick &&
          this.props.onCellClick(
            {
              ...cell,
              date: this.getDateFromCell(moment(this.props.currentDate), cell)
            },
            null
          );

        let min = this.getMin(cell, blockedPanels);
        let max = this.getMax(cell, blockedPanels);
        await this.setState({
          leftX: min,
          rightX: max,
          firstPoint: {
            ...cell,
            date: this.getDateFromCell(moment(this.props.currentDate), cell)
          }
        });
        if (this.layer) {
          styler(this.layer.current).set({
            left: cell.position.x + CELL_PADDING_LEFT,
            right:
              this.row.current.scrollWidth -
              cell.position.x2 -
              CELL_PADDING_RIGHT,
            top: cell.position.y + CELL_PADDING_TOP,
            bottom: CELL_PADDING_BOTTOM,
            opacity: 1
          });
        }
      } else if (firstPoint && !secondPoint) {
        if (firstPoint.index > cell.index) {
          await this.setState({
            secondPoint: {
              ...firstPoint,
              date: moment(firstPoint.date).add({ minutes: 30 })
            },
            firstPoint: {
              ...cell,
              date: this.getDateFromCell(moment(this.props.currentDate), cell)
            }
          });
          this.props.onCellClick &&
            this.props.onCellClick(
              this.state.firstPoint,
              this.state.secondPoint
            );
        } else {
          this.setState({
            secondPoint: {
              ...cell,
              date: this.getDateFromCell(
                moment(this.props.currentDate),
                cell
              ).add({ minutes: 30 })
            }
          });
          this.props.onCellClick &&
            this.props.onCellClick(firstPoint, {
              ...cell,
              date: this.getDateFromCell(
                moment(this.props.currentDate),
                cell
              ).add({ minutes: 30 })
            });
        }
      } else if (firstPoint && secondPoint) {
        this.props.onCellClick && this.props.onCellClick(null, null);
        this.setState({
          firstPoint: null,
          secondPoint: null,
          leftX: null,
          rightX: null
        });
      }
    } else {
      this.setState({
        firstPoint: null,
        secondPoint: null
      });
    }
  };
  componentDidMount() {
    this._listener = this.row.current.addEventListener(
      "mousemove",
      this.mouseMove
    );
    const { dataRange } = this.props;
    if (dataRange) {
      const range = this.getTimeRange(
        moment(dataRange.start),
        moment(dataRange.end)
      );
      if (range && range.firstPoint && range.secondPoint) {
        this.setState({
          secondPoint: range.secondPoint,
          firstPoint: range.firstPoint
        });
      }
    }

    this.getBlocked();
  }
  mouseMove = e => {
    const { firstPoint, secondPoint, leftX, rightX } = this.state;
    const x = e.pageX - this.row.current.offsetLeft;
    if (!secondPoint) {
      if (firstPoint && this.layer.current && this.row.current) {
        if (
          firstPoint.position.x2 < x &&
          e.target &&
          e.target.classList.contains("row-cell") &&
          (rightX ? x <= rightX.x : true)
        ) {
          styler(this.layer.current).set({
            right:
              this.row.current.scrollWidth -
              (e.target.clientWidth + e.target.offsetLeft) -
              CELL_PADDING_RIGHT,
            left: firstPoint.position.x + CELL_PADDING_LEFT
          });
        } else if (
          firstPoint.position.x > x &&
          e.target &&
          e.target.classList.contains("row-cell") &&
          (leftX ? x >= leftX.x : true)
        ) {
          styler(this.layer.current).set({
            left: e.toElement.offsetLeft + CELL_PADDING_LEFT,
            right:
              this.row.current.scrollWidth -
              firstPoint.position.x2 -
              CELL_PADDING_RIGHT
          });
        } else {
          if (firstPoint.ref.current === e.target) {
            styler(this.layer.current).set({
              left: firstPoint.position.x + CELL_PADDING_LEFT,
              right:
                this.row.scrollWidth -
                this.row.current.scrollWidth -
                firstPoint.position.x2 -
                CELL_PADDING_RIGHT
            });
          }
        }
        if (POPOVER_ENABLED && this.popover.current && firstPoint) {
          const currCell = this.cells.find(a => a.ref.current === e.target);
          if (currCell) {
            this.popover.current.innerHTML = `<h4>${this.getDateFromCell(
              moment(this.props.currentDate),
              currCell
            ).format("HH:mm")}</h4>`;
          }
          styler(this.popover.current).set({
            left:
              e.toElement.offsetLeft +
              CELL_WIDTH -
              this.popover.current.clientWidth / 2
          });
        }
      }
    }
  };
  componentWillUnmount() {
    if (this._listener) {
      this._listener.removeEventListener("mousemove", this.mouseMove);
    }
  }

  range = (start, end) => {
    if (start === end) return [start];
    return [start, ...this.range(start + 1, end)];
  };

  getPanel = () => {
    const { firstPoint, secondPoint } = this.state;
    const style =
      firstPoint && secondPoint
        ? {
            left: firstPoint.position.x + CELL_PADDING_LEFT,
            right:
              this.row.current.scrollWidth -
              secondPoint.position.x2 -
              CELL_PADDING_RIGHT,
            opacity: 1
          }
        : {};
    if (firstPoint) {
      return (
        <div ref={this.layer} style={style} className="schedule-panel"></div>
      );
    }
  };
  roundMinutes = (date, duration, method) => {
    return moment(Math[method](+date / +duration) * +duration);
  };

  getTimeRange = (startDate, endDate) => {
    const start = this.roundMinutes(
      startDate,
      moment.duration(30, "minutes"),
      "floor"
    );
    const end =
      moment(endDate).minutes() === 0 || moment(endDate).minutes() === 30
        ? moment(endDate)
        : this.roundMinutes(endDate, moment.duration(30, "minutes"), "ceil");

    const secondPos = this.cells.find(x => {
      return this.getDateFromCell(moment(this.props.currentDate), x).isSame(
        end,
        "minutes"
      );
    });

    const firstPos = this.cells.find(x => {
      return this.getDateFromCell(moment(this.props.currentDate), x).isSame(
        start,
        "minutes"
      );
    });
    return {
      firstPoint: firstPos,
      secondPoint: secondPos
    };
  };

  getBlocked = () => {
    const { blockedDates } = this.props;
    const now = blockedDates
      ? blockedDates
          .filter(x =>
            moment(x.start).isSame(moment(this.props.currentDate), "day")
          )
          .map((item, key) => {
            const { firstPoint, secondPoint } = this.getTimeRange(
              moment(item.start),
              moment(item.end)
            );
            const text = `${
              this.getDateFromCell(this.props.currentDate, firstPoint)
                ? this.getDateFromCell(
                    this.props.currentDate,
                    firstPoint
                  ).format("HH:mm")
                : ""
            }-${
              this.getDateFromCell(this.props.currentDate, secondPoint)
                ? this.getDateFromCell(
                    this.props.currentDate,
                    secondPoint
                  ).format("HH:mm")
                : ""
            }`;
            return firstPoint && secondPoint
              ? {
                  x: firstPoint.position.x,
                  x2: secondPoint.position.x2,
                  index: firstPoint.index - 1,
                  index2: secondPoint.index - 1,
                  element: (
                    <div
                      key={`blocked-panel-${key}`}
                      style={{
                        backgroundColor: "red",
                        height: 48,
                        position: "absolute",
                        left: firstPoint.position.x + CELL_PADDING_LEFT,
                        right:
                          this.row.current.scrollWidth - secondPoint.position.x
                      }}
                      className="blocked-layer"
                    >
                      <div className="layer-content">{text}</div>
                    </div>
                  )
                }
              : null;
          })
          .filter(x => x !== null)
      : [];
    this.setState({
      blockedPanels: now
    });
  };

  render() {
    const {
      range,
      firstPoint,
      secondPoint,
      blockedPanels,
      leftX,
      rightX
    } = this.state;
    const { user } = this.props;
    const numArray = Array.from(
      new Array((range[1] - range[0]) * 2),
      (x, i) => i
    );
    const panel = this.getPanel();

    return (
      <div className="row-wrapper">
        <div className="wrapper-info">
          <span className="info-name">{user && user.name}</span>
        </div>
        <div ref={this.row} className="schedule-row">
          {POPOVER_ENABLED ? (
            <div
              className="row-popover"
              style={{
                display: firstPoint && !secondPoint ? "block" : "none",
                ...(firstPoint && {
                  left: firstPoint.position.x + CELL_WIDTH / 2
                })
              }}
              ref={this.popover}
            ></div>
          ) : null}

          {blockedPanels
            ? blockedPanels.map((item, key) => item && item.element)
            : null}
          {panel}
          {numArray.map((item, key) => {
            const cellClassName =
              (leftX && leftX.index2 > item) || (rightX && rightX.index <= item)
                ? "blocked"
                : "";
            return (
              <Cell
                className={cellClassName}
                getRef={ref => (this.cells[key] = ref)}
                index={item + 1}
                rowKey={this.props.user.id}
                onClick={this.handleOnCellClick}
                key={`${key}-cell`}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
