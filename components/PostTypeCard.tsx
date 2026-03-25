"use client";

import { useStore } from "@/lib/store";
import { renderCaption } from "@/lib/caption-template";
import type { PostType } from "@/lib/types";
import { WEEKDAY_SELECT_OPTIONS, computeScheduleDate } from "@/lib/schedule-weekday";

interface Props {
  postType: PostType;
}

export default function PostTypeCard({ postType }: Props) {
  const { state, updatePostType, removePostType } = useStore();

  const w = state.weekNumber ?? 1;
  const anchor = state.leagueWeek1Monday?.trim() ?? "";
  const locWd = postType.locationWeekday ?? 1;
  const tierWd = postType.tierWeekday ?? 1;
  const scheduledLocationDate = computeScheduleDate(
    postType.id,
    w,
    anchor,
    locWd
  );
  const scheduledTierDate = computeScheduleDate(
    postType.id,
    w,
    anchor,
    tierWd
  );
  const locationDate =
    postType.defaultDateLocked && postType.defaultDate.trim()
      ? postType.defaultDate
      : scheduledLocationDate;
  const tierDate =
    postType.tierDefaultDateLocked && postType.tierDefaultDate.trim()
      ? postType.tierDefaultDate
      : scheduledTierDate;
  const sampleVars = {
    divAbb: "BUF2",
    divName: "Buffalo",
    conf: "Tier 2",
    week: w,
    upcomingWeek: w + 1,
    type: postType.label,
  };

  const update = (updates: Partial<PostType>) =>
    updatePostType(postType.id, updates);

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        postType.enabled
          ? "border-blue-200 bg-white dark:border-blue-800 dark:bg-zinc-900"
          : "border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-700 dark:bg-zinc-900/50"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={postType.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
              className="accent-blue-600"
            />
            <input
              type="text"
              value={postType.label}
              onChange={(e) => update({ label: e.target.value })}
              className="border-b border-transparent bg-transparent text-sm font-semibold focus:border-blue-400 focus:outline-none"
              readOnly={postType.isBuiltIn}
            />
          </label>
        </div>
        {!postType.isBuiltIn && (
          <button
            onClick={() => removePostType(postType.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            Location accounts
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Caption Template
            </label>
            <textarea
              value={postType.captionTemplate}
              onChange={(e) => update({ captionTemplate: e.target.value })}
              rows={2}
              placeholder="Week {week} {divName} {type} are here! #NBHL"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <p className="mt-0.5 text-xs italic text-zinc-400">
              Sample:{" "}
              {postType.captionTemplate
                ? renderCaption(postType.captionTemplate, sampleVars)
                : "Enter a template above"}
            </p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Post day
              </label>
              <select
                value={locWd}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  update({
                    locationWeekday: n,
                    defaultDateLocked: false,
                    defaultDate: "",
                  });
                }}
                className="mb-1 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              >
                {WEEKDAY_SELECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Post date
              </label>
              <input
                type="date"
                value={locationDate}
                onChange={(e) =>
                  update({
                    defaultDate: e.target.value,
                    defaultDateLocked: true,
                  })
                }
                className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Post time
              </label>
              <input
                type="time"
                value={postType.defaultTime}
                onChange={(e) => update({ defaultTime: e.target.value })}
                className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
          </div>
          {postType.defaultDateLocked ? (
            <p className="mt-1.5 text-xs text-zinc-500">
              Date is manual.{" "}
              <button
                type="button"
                onClick={() =>
                  update({
                    defaultDateLocked: false,
                    defaultDate: "",
                  })
                }
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Match schedule again
              </button>
            </p>
          ) : null}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
            Tier accounts
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Tier Caption Template
            </label>
            <textarea
              value={postType.tierCaptionTemplate}
              onChange={(e) => update({ tierCaptionTemplate: e.target.value })}
              rows={2}
              placeholder="Week {week} {conf} {type} are here! #NBHL"
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <p className="mt-0.5 text-xs italic text-zinc-400">
              Sample:{" "}
              {postType.tierCaptionTemplate
                ? renderCaption(postType.tierCaptionTemplate, sampleVars)
                : "Enter a template above"}
            </p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Post day
              </label>
              <select
                value={tierWd}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  update({
                    tierWeekday: n,
                    tierDefaultDateLocked: false,
                    tierDefaultDate: "",
                  });
                }}
                className="mb-1 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              >
                {WEEKDAY_SELECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Post date
              </label>
              <input
                type="date"
                value={tierDate}
                onChange={(e) =>
                  update({
                    tierDefaultDate: e.target.value,
                    tierDefaultDateLocked: true,
                  })
                }
                className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Post time
              </label>
              <input
                type="time"
                value={postType.tierDefaultTime}
                onChange={(e) =>
                  update({ tierDefaultTime: e.target.value })
                }
                className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
          </div>
          {postType.tierDefaultDateLocked ? (
            <p className="mt-1.5 text-xs text-zinc-500">
              Date is manual.{" "}
              <button
                type="button"
                onClick={() =>
                  update({
                    tierDefaultDateLocked: false,
                    tierDefaultDate: "",
                  })
                }
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Match schedule again
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
