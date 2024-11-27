import { Button, Form, Stack, Row, Col } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import { Link, useNavigate } from "react-router-dom";
import { NoteData, Tag } from "../App";
import { FormEvent, useRef, useState } from "react";
import { v4 as uuidV4 } from "uuid";

type NoteFormProps = {
  onSubmit: (data: NoteData) => void;
  onAddTag: (tag: Tag) => void;
  availableTags: Tag[];
} & Partial<NoteData>;

export function NoteForm({
  onSubmit,
  onAddTag,
  availableTags,
  title = "",
  tags = [],
  markdown = "",
}: NoteFormProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(tags);
  const navigate = useNavigate();
  const [attachments, setAttachments] = useState<File[]>([]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  }

//   function handleSubmit(e: FormEvent) {
//     e.preventDefault();

//     onSubmit({
//       title: titleRef.current!.value,
//       markdown: markdownRef.current!.value,
//       tags: selectedTags,
//       attachments: attachments.map((file) => file.name), // Attach file names or URLs for further processing
//     });

//     navigate("..");
    //   }
function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Save images to local storage and get their URLs
    const imageUrls = attachments.map((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise<string>((resolve) => {
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const uniqueKey = `image-${uuidV4()}`;
                localStorage.setItem(uniqueKey, dataUrl);
                resolve(uniqueKey);
            };
        });
    });

    Promise.all(imageUrls).then((storedKeys) => {
        onSubmit({
            title: titleRef.current!.value,
            markdown: markdownRef.current!.value,
            tags: selectedTags,
            attachments: storedKeys, // Save image keys
        });

        navigate("..");
    });
}


  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Stack gap={3}>
          <Row>
            <Col>
              <Form.Group controlId="title">
                <Form.Label>Title</Form.Label>
                <Form.Control ref={titleRef} required defaultValue={title} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="tags">
                <Form.Label>Tags</Form.Label>
                <CreatableSelect
                  onCreateOption={(label) => {
                    const newTag = { id: uuidV4(), label };
                    onAddTag(newTag);
                    setSelectedTags((prev) => [...prev, newTag]);
                  }}
                  value={selectedTags.map((tag) => ({
                    label: tag.label,
                    value: tag.id,
                  }))}
                  options={availableTags.map((tag) => ({
                    label: tag.label,
                    value: tag.id,
                  }))}
                  onChange={(tags) =>
                    setSelectedTags(
                      tags.map((tag) => ({
                        label: tag.label,
                        id: tag.value,
                      }))
                    )
                  }
                  isMulti
                />
              </Form.Group>
            </Col>
                  </Row>
                  <Form.Group>
  <Form.Label>Note Attachments</Form.Label>
  <input type="file" multiple onChange={handleFileUpload} className="form-control" />
</Form.Group>

          <Form.Group controlId="markdown">
            <Form.Label>Body</Form.Label>
            <Form.Control
              defaultValue={markdown}
              required
              as="textarea"
              ref={markdownRef}
              rows={15}
            />
          </Form.Group>
          
          <Stack direction="horizontal" gap={2} className="justify-content-end">
            <Button type="submit" variant="primary">
              Save
            </Button>
            <Link to="..">
              <Button type="button" variant="outline-secondary">
                Cancel
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Form>
    </>
  );
}
