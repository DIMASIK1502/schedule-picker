import React, { Component } from "react";
import Row from "./Row";
import moment from "moment";
import "moment/locale/ru";
import "./Schedule.scss";

moment.locale("ru");

const TEST_DATA = [
  {
    user: {
      id: 49,
      name: "worker",
      occupation: null
    },
    schedule: [
      {
        start: "2019-09-23T17:45:00",
        end: "2019-09-23T17:45:00"
      },
      {
        start: "2019-09-23T18:45:00",
        end: "2019-09-23T19:45:00"
      },
      {
        start: "2019-09-23T09:10:12",
        end: "2019-09-23T11:10:12"
      }
    ]
  },
  {
    user: {
      id: 57,
      name: "worker2",
      occupation: "Слесарь"
    },
    schedule: [
      {
        start: "2019-09-23T10:00:00",
        end: "2019-09-23T12:45:00"
      }
    ]
  }
];

export default class Schedule extends Component {
  constructor() {
    super();
    this.schedule = React.createRef();
    this.state = {
      startPoint: null,
      endPoint: null,
      currentDate: moment(),
      active: null
    };
  }
  range = (start, end) => {
    if (start === end) return [start];
    return [start, ...this.range(start + 1, end)];
  };

  render() {
    const { currentDate, firstPoint, secondPoint, active } = this.state;
    return (
      <div className="schedule-wrapper">
        <div className="schedule-labels" />

        <div className="schedule-workspace">
          <div className="workspace-header">
            <div className="header-timeline">
              {this.range(8, 24).map((item, index) =>
                item !== 24 ? (
                  <div
                    key={`time-${index}`}
                    className="timeline-cell"
                    style={{ height: 30 }}
                  >
                    {item}:00
                  </div>
                ) : null
              )}
            </div>
          </div>
          <div ref={this.schedule} className="workspace-content">
            {TEST_DATA.map((entity, key) => (
              <Row
                active={active && active === entity.user.id ? true : false}
                startPoint={firstPoint}
                endPoint={secondPoint}
                user={entity.user}
                blockedDates={entity.schedule}
                key={`row-${key}`}
                dataRange={null}
                onCellClick={(start, end) => {
                  console.log(entity);
                  console.log(start);
                  this.setState({
                    startPoint: start,
                    endPoint: end,
                    active: start ? start.key : null
                  });
                }}
                currentDate={currentDate}
              ></Row>
            ))}
          </div>
        </div>
        <div className="d-flex flex-column">
          <p>
            {this.state.startPoint
              ? moment(this.state.startPoint.date).format(
                  "YYYY MMMM DD - HH:mm"
                )
              : ""}
          </p>
          <p>
            {this.state.endPoint
              ? moment(this.state.endPoint.date).format("YYYY MMMM DD - HH:mm")
              : ""}
          </p>
        </div>
      </div>
    );
  }
}
