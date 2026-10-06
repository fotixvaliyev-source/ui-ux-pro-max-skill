"use client";

import { useActionState, useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { initialState } from "@/lib/action-state";
import { RESOURCE_KINDS } from "@/lib/constants";
import { createResourceAction, updateResourceAction } from "@/server/actions/resources";
import { ActionForm, FormGrid, FormMessage, SubmitButton, fieldError } from "./form-parts";

const KIND_LABEL: Record<(typeof RESOURCE_KINDS)[number], string> = { LINK: "Link", FILE: "File", NOTE: "Note" };

interface Defaults { kind: string; title: string; whyUseful: string; url: string; body: string; tags: string }

export function ResourceForm({ circleId, resourceId, defaults }: { circleId: string; resourceId?: string; defaults?: Defaults }) {
  const bound = resourceId ? updateResourceAction.bind(null, circleId, resourceId) : createResourceAction.bind(null, circleId);
  const [state, action] = useActionState(bound, initialState);
  const [kind, setKind] = useState(defaults?.kind ?? "LINK");
  const e = (n: string) => fieldError(state, n);
  return (
    <ActionForm action={action} state={state} resetOnSuccess={!resourceId} className="flex flex-col gap-4">
      <FormGrid>
        {resourceId ? (
          <input type="hidden" name="kind" value={kind} />
        ) : (
          <Field label="Type" htmlFor="kind" error={e("kind")}>
            <Select id="kind" name="kind" value={kind} onChange={(ev) => setKind(ev.target.value)}>
              {RESOURCE_KINDS.map((k) => (<option key={k} value={k}>{KIND_LABEL[k]}</option>))}
            </Select>
          </Field>
        )}
        <Field label="Title" htmlFor="title" error={e("title")}><Input id="title" name="title" defaultValue={defaults?.title ?? ""} maxLength={140} required /></Field>
        {kind === "LINK" ? <Field label="Link" htmlFor="url" error={e("url")}><Input id="url" name="url" type="url" defaultValue={defaults?.url ?? ""} placeholder="https://" /></Field> : null}
        {kind === "FILE" && !resourceId ? (
          <Field label="File" htmlFor="file" hint="PDF, image, text or Office document. Up to 5 MB." error={e("file")}>
            <Input id="file" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.docx,.xlsx,.pptx" className="h-auto py-2" />
          </Field>
        ) : null}
        {kind === "NOTE" ? <Field label="Note" htmlFor="body" error={e("body")}><Textarea id="body" name="body" defaultValue={defaults?.body ?? ""} maxLength={10000} className="min-h-[120px]" /></Field> : null}
        <Field label="Why this is useful" htmlFor="whyUseful" hint="One sentence for the next person who finds it." error={e("whyUseful")}>
          <Textarea id="whyUseful" name="whyUseful" defaultValue={defaults?.whyUseful ?? ""} maxLength={500} className="min-h-[72px]" required />
        </Field>
        <Field label="Tags" htmlFor="tags" hint="Separate with commas." error={e("tags")}><Input id="tags" name="tags" defaultValue={defaults?.tags ?? ""} /></Field>
      </FormGrid>
      <FormMessage state={state} success={resourceId ? "Saved." : "Added to the library."} />
      <div><SubmitButton pending="Saving...">{resourceId ? "Save changes" : "Add to the library"}</SubmitButton></div>
    </ActionForm>
  );
}
