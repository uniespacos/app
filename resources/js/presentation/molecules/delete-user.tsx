import DeleteItem from '@/presentation/molecules/delete-item';

export default function DeleteUser() {
    return <DeleteItem itemName="conta" route={route('settings.profile.destroy')} showHeading={true} />;
}
