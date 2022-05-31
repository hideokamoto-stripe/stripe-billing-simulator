import React, { useState, useEffect, useRef } from "react";
import differenceInDays from "date-fns/differenceInDays";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import differenceInMonths from "date-fns/differenceInMonths";
import differenceInCalendarMonths from "date-fns/differenceInCalendarMonths";
import differenceInCalendarYears from "date-fns/differenceInCalendarYears";
import previousMonday from "date-fns/previousMonday";
import addMonths from "date-fns/addMonths";
import addDays from "date-fns/addDays";
import getDate from "date-fns/getDate";
import dynamic from "next/dynamic";
import { useXarrow } from "react-xarrows";
// import Xarrow from "react-xarrows";

const Xarrow = dynamic(() => import("react-xarrows"), { ssr: false });

function Eventpoint({ parameter }) {
  const updateXarrow = useXarrow();

  const [timelineWidth, setTimelineWidth] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    setTimelineWidth(ref.current.clientWidth);
  });
  useEffect(() => {
    updateXarrow();
  }, [parameter]);

  let timeline = "";

  const endDate =
    parameter.billing_cycle_anchor !== null
      ? parameter.billing_cycle_anchor
      : parameter.trial_end !== null
      ? parameter.trial_end
      : parameter.create_date;

  const updateDate =
    parameter.interval === "year"
      ? addDays(new Date(endDate), parameter.interval_count * 365)
      : parameter.interval === "month"
      ? addMonths(new Date(endDate), parameter.interval_count * 1)
      : parameter.interval === "week"
      ? addDays(new Date(endDate), parameter.interval_count * 7)
      : addDays(new Date(endDate), parameter.interval_count);
  const timelineStart =
    parameter.interval === "day"
      ? parameter.create_date
      : parameter.interval === "week"
      ? previousMonday(parameter.create_date)
      : parameter.interval === "year"
      ? new Date(parameter.create_date.getFullYear(), 1, 1)
      : new Date(
          parameter.create_date.getFullYear(),
          parameter.create_date.getMonth(),
          1
        );

  // const updatePoint = differenceInDays(updateDate, timelineStart);
  const updatePoint =
    parameter.interval === "day"
      ? differenceInCalendarDays(updateDate, timelineStart)
      : differenceInMonths(updateDate, timelineStart) * 30 +
        differenceInDays(
          updateDate,
          addMonths(
            timelineStart,
            differenceInMonths(updateDate, timelineStart)
          )
        );
  const startPoint = differenceInDays(
    getDate(parameter.create_date) === 31
      ? addDays(parameter.create_date, -1)
      : parameter.create_date,
    timelineStart
  );
  const billingPoint =
    parameter.billing_cycle_anchor === null
      ? 0
      : parameter.interval === "day"
      ? differenceInCalendarDays(parameter.billing_cycle_anchor, timelineStart)
      : differenceInMonths(
          getDate(parameter.billing_cycle_anchor) === 31
            ? addDays(parameter.billing_cycle_anchor, -1)
            : parameter.billing_cycle_anchor,
          timelineStart
        ) *
          30 +
        differenceInDays(
          getDate(parameter.billing_cycle_anchor) === 31
            ? addDays(parameter.billing_cycle_anchor, -1)
            : parameter.billing_cycle_anchor,
          addMonths(
            timelineStart,
            differenceInMonths(
              getDate(parameter.billing_cycle_anchor) === 31
                ? addDays(parameter.billing_cycle_anchor, -1)
                : parameter.billing_cycle_anchor,
              timelineStart
            )
          )
        );
  const trialEndPoint =
    parameter.trial_end === null
      ? 0
      : parameter.interval === "day"
      ? differenceInCalendarDays(parameter.trial_end, timelineStart)
      : differenceInMonths(
          getDate(parameter.trial_end) === 31
            ? addDays(parameter.trial_end, -1)
            : parameter.trial_end,
          timelineStart
        ) *
          30 +
        differenceInDays(
          getDate(parameter.trial_end) === 31
            ? addDays(parameter.trial_end, -1)
            : parameter.trial_end,
          addMonths(
            timelineStart,
            differenceInMonths(
              getDate(parameter.trial_end) === 31
                ? addDays(parameter.trial_end, -1)
                : parameter.trial_end,
              timelineStart
            )
          )
        );
  // const trialEndPoint = differenceInDays(parameter.trial_end, timelineStart);

  switch (parameter.interval) {
    case "month":
      timeline =
        differenceInCalendarMonths(
          new Date(
            endDate.getFullYear(),
            endDate.getMonth() + parameter.interval_count * 1 + 2,
            1
          ),
          endDate
        ) *
          30 +
        differenceInCalendarMonths(endDate, timelineStart) * 30;

      break;
    case "year":
      timeline =
        differenceInCalendarYears(
          new Date(
            endDate.getFullYear() + parameter.interval_count * 1 + 1,
            endDate.getMonth(),
            1
          ),
          timelineStart
        ) * 365;
      break;
    case "week":
      timeline = differenceInCalendarDays(
        new Date(endDate).setDate(
          endDate.getDate() + parameter.interval_count * 7 + 14
        ),
        parameter.create_date
      );
      break;
    case "day":
      timeline = differenceInCalendarDays(
        new Date(endDate).setDate(
          endDate.getDate() + parameter.interval_count * 1 + 1
        ),
        parameter.create_date
      );
      break;
    default:
      365;
  }

  const width1 =
    (timelineWidth - 6) * (startPoint / timeline) - 48 + 6 + 48 < 0
      ? 0
      : (timelineWidth - 6) * (startPoint / timeline) - 48 + 6 + 48;
  const width2 =
    (timelineWidth - 6) * (trialEndPoint / timeline) -
      48 +
      6 -
      96 -
      width1 +
      48 >
    0
      ? (timelineWidth - 6) * (trialEndPoint / timeline) +
        6 -
        48 -
        96 -
        width1 +
        48
      : 0;
  const width3 =
    (timelineWidth - 6) * (billingPoint / timeline) -
      48 +
      6 -
      96 -
      96 * (trialEndPoint === 0 ? 0 : 1) -
      width1 -
      width2 +
      48 >
    0
      ? (timelineWidth - 6) * (billingPoint / timeline) -
        48 +
        6 -
        96 -
        96 * (trialEndPoint === 0 ? 0 : 1) -
        width1 -
        width2 +
        48
      : 0;
  const width4 =
    (timelineWidth - 6) * (updatePoint / timeline) -
    48 +
    6 -
    96 -
    96 * (trialEndPoint === 0 ? 0 : 1) -
    96 * (billingPoint === 0 ? 0 : 1) -
    width1 -
    width2 -
    width3 +
    48;

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  // console.log("width:" + timelineWidth);
  // console.log("width1:" + width1);
  // console.log("width2:" + width2);
  // console.log("width3:" + width3);
  // console.log("width4:" + width4);
  // console.log("endDate:" + endDate);
  // console.log("updateDate:" + updateDate);
  // console.log("timeline:" + timeline);
  // console.log("startPoint:" + startPoint);
  // console.log("trialEndPoint:" + trialEndPoint);
  // console.log("billingPoint:" + billingPoint);
  // console.log("updatePoint:" + updatePoint);
  return (
    <div className=" bottom-5">
      {/* create the event description */}
      <div className="pt-10 mx-0 relative">
        <div
          className="static inline-block h-2"
          style={{ width: width1 + "px" }}
        />
        <span
          id="d-create-date"
          className=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center"
        >
          {parameter.billing_cycle_anchor !== null &&
          parameter.trial_end === null &&
          parameter.proration_behavior === "create_prorations"
            ? "Creation  Charge"
            : "Creation"}
        </span>
        {parameter.trial_end === null ? null : (
          <div className=" inline-block">
            <div
              className="static inline-block"
              style={{
                width: width2 + "px",
              }}
            />
            <span
              id="d-trial_end"
              className=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center"
            >
              Trial End Charge
            </span>
          </div>
        )}
        {parameter.billing_cycle_anchor === null ? null : (
          <div className=" inline-block">
            <div
              className="static inline-block"
              style={{
                width: width3 + "px",
              }}
            />
            <span
              id="d-billing-date"
              className=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center"
            >
              Charge
            </span>
          </div>
        )}
        <div
          className="static inline-block"
          style={{
            width: width4 + "px",
          }}
        />
        <span
          id="d-update-point"
          className=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center "
        >
          Charge for Update
        </span>
      </div>

      {/* Create the date point */}
      <div ref={ref} className="h-5 mx-12 relative z-20">
        <div
          id="p-create_date"
          className={classNames(
            "w-3 h-3 bg-[#80E9FF] border-[#7A73FF] border-2  rounded-full absolute -bottom-2 "
          )}
          style={{ left: (timelineWidth - 6) * (startPoint / timeline) + "px" }}
        />
        <Xarrow
          startAnchor={"bottom"}
          endAnchor={"top"}
          color={"#0A2540"}
          headSize={4}
          start="d-create-date" //can be react ref
          end="p-create_date" //or an id
          strokeWidth={2}
        />

        {parameter.trial_end === null ? null : (
          <div>
            <div
              id="p-trial_end"
              className={classNames(
                "w-3 h-3 bg-[#80E9FF] border-[#7A73FF] border-2 rounded-full absolute -bottom-2 "
              )}
              style={{
                left: (timelineWidth - 6) * (trialEndPoint / timeline) + "px",
              }}
            />
            <Xarrow
              startAnchor={"bottom"}
              endAnchor={"top"}
              color="#0A2540"
              headSize={4}
              start="d-trial_end" //can be react ref
              end="p-trial_end" //or an id
              strokeWidth={2}
            />
          </div>
        )}
        {parameter.billing_cycle_anchor === null ? null : (
          <div>
            <div
              id="p-billing-date"
              className={classNames(
                "w-3 h-3 bg-[#80E9FF] border-[#7A73FF] border-2 rounded-full absolute -bottom-2 "
              )}
              style={{
                left: (timelineWidth - 6) * (billingPoint / timeline) + "px",
              }}
            />
            <Xarrow
              startAnchor={"bottom"}
              endAnchor={"top"}
              color="#0A2540"
              headSize={4}
              start="d-billing-date" //can be react ref
              end="p-billing-date" //or an id
              strokeWidth={2}
            />
          </div>
        )}
        <div>
          <div
            id="p-update-point"
            className={classNames(
              "w-3 h-3 bg-[#80E9FF] border-[#7A73FF] border-2 rounded-full absolute -bottom-2 "
            )}
            style={{
              left: (timelineWidth - 6) * (updatePoint / timeline) + "px",
            }}
          />
          <Xarrow
            startAnchor={"bottom"}
            endAnchor={"top"}
            color="#0A2540"
            headSize={4}
            start="d-update-point" //can be react ref
            end="p-update-point" //or an id
            strokeWidth={2}
          />
        </div>
      </div>
    </div>
  );
}

export default Eventpoint;
