document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // 
  document.querySelector('#compose-form').addEventListener('submit', send_e)

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view_email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_e(event) {
  event.preventDefault();
  
  //Take input 
  const form = document.querySelector('#compose-form');
  const recipients = form['compose-recipients'].value;
  const subject = form['compose-subject'].value;
  const body = form['compose-body'].value;

  //Send Input via API 
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
        archived: 'false',
        read: 'false',
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  load_mailbox('sent')
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view_email').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //query API
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      
      emails.forEach(email => {
          //create div
          const single_email_div = document.createElement('div');
    
          //create p
          const recipients_p = document.createElement('p');
          const subject_p = document.createElement('p');
          const body_p = document.createElement('p');

          //add p to the div  
          single_email_div.appendChild(recipients_p);
          single_email_div.appendChild(subject_p);
          single_email_div.appendChild(body_p);

          //adding text
          recipients_p.innerHTML = `<strong> Recipients: </strong>${email.recipients}`;
          subject_p.innerHTML = `<strong>Subject</strong>: ${email.subject}`;
          body_p.innerHTML = `<strong>Body:</strong> ${email.body}`;
          
          //update box background if read 
          if (email.read === true) {
            single_email_div.classList.add("emailbox2")
            }
          if (email.read === false) {
              single_email_div.classList.add("emailbox1")
              }
          
          //add button to archive and event listener
          if (mailbox != 'sent'){
            const button = document.createElement('button');
            button.innerHTML = email.archived ? "Unarchive" : "Archive";
            single_email_div.appendChild(button);
            button.addEventListener('click', () => {
            fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
            "archived": !email.archived
                })
              })
            .then( response => load_mailbox('inbox'))
            })
          }

        //add to the DOM:
        document.querySelector('#emails-view').appendChild(single_email_div);


        //add event listener and link
        single_email_div.addEventListener('click', function(e) {
        e.preventDefault
        console.log('This element has been clicked!')
        view_email(email.id)
        });

      })
        
  
    }
)}

function view_email(email_id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view_email').style.display = 'block'

  //Show email
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email)
    document.querySelector('#view_email').innerHTML = `<div> <strong> Sender: </strong>${email.sender}</div>
    <div> <strong> Recipients: </strong>${email.recipients}</div>
    <div><strong>Subject</strong>: ${email.subject}</div>
    <div><strong>Body:</strong> ${email.body}</div>
    <div> <strong>Timestamp:</strong> ${email.timestamp}</div>
    <button id='replay_button'>Replay</button>
    `
    //add interaction to button
    document.querySelector('#replay_button').addEventListener('click', function(e) {
      e.preventDefault
      console.log('I want to replay')
      replay(email.id)
      });
  });

  //Update property to viewed

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      "read": true
    })
  })
  
}

function replay (email_id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view_email').style.display = 'none';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email)
    document.querySelector('#compose-recipients').value = `${email.sender}`;
    const s = email.subject.substr(0,3)
    if (s === 'Re:') {
    document.querySelector('#compose-subject').value = `${email.subject}`;} 
    else { document.querySelector('#compose-subject').value = `Re:${email.subject}`}
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:${email.body}`;
    
  });



}