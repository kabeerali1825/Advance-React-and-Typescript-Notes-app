import { useNote } from './NoteLayout';
import { Badge, Button, Col, Row, Stack } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

type NotesProps = {
  onDelete: (id: string) => void;
};

function Note({ onDelete }: NotesProps) {
  const note = useNote();
  const navigate = useNavigate();

  // Extracting images from the attachments array
  const images = note.attachments?.map((key) => {
    const item = localStorage.getItem(key);
    return item?.startsWith('data:image/') ? item : null;  
  }).filter(Boolean) || [];

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1>{note.title}</h1>
          {note.tags.length > 0 && (
            <Stack gap={1} direction="horizontal" className="flex-wrap">
              {note.tags.map((tag) => (
                <Badge className="text-truncate" key={tag.id}>
                  {tag.label}
                </Badge>
              ))}
            </Stack>
          )}
        </Col>
        <Col xs="auto">
          <Stack gap={2} direction="horizontal">
            <Link to={`/${note.id}/edit`}>
              <Button variant="primary">Edit</Button>
            </Link>
            <Button
              variant="outline-danger"
              onClick={() => {
                onDelete(note.id);
                navigate('/');
              }}
            >
              Delete
            </Button>
            <Link to="/">
              <Button variant="outline-secondary">Back</Button>
            </Link>
          </Stack>
        </Col>
      </Row>

      <ReactMarkdown>{note.markdown}</ReactMarkdown>

      {/* Display images if any */}
      {images.length > 0 && (
        <div>
          {images.map((src, index) => (
            <img
              key={index}
              src={src || 'path/to/fallback-image.png'} // Fallback if no image found
              alt={`Attachment ${index + 1}`}
              style={{ maxWidth: '100%', maxHeight: '300px', margin: '5px' }}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default Note;
