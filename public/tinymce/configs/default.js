tinymce.init({
  selector: 'textarea#tinymce-editor',
  base_url: '/tinymce',
  suffix: '.min',
  height: 500,
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | blocks | ' +
    'bold italic forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | code | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
});