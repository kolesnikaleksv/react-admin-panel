import $ from 'jquery';

function getPageList() {
  $("h1").remove();
  $.get("./api", data => {
    data.forEach((file, i)=> {
      $("body").append(`<h1>${file}</h1>`)
    })
  }, "JSON");
}

getPageList();

$('button').on('click', () => {
  $.post('./api/createNewFile.php', {
    name: $('input').val()
  }, () => {
    getPageList();
  })
  .fail(() => {
    alert("The page already exist!")
  })
})